import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument, ConversationType } from './entities/conversation.entity';
import { 
  CreateConversationDto, 
  CreateMessageInConversationDto, 
  GetConversationsDto,
  GetConversationMessagesDto,
  MarkMessagesAsReadDto 
} from './dto/create-conversation.dto';
import { EventService } from '../event/event.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name) 
    private conversationModel: Model<ConversationDocument>,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
  ) {}

  /**
   * Créer ou récupérer une conversation privée entre deux utilisateurs
   */
  async findOrCreatePrivateConversation(userId1: string, userId2: string): Promise<ConversationDocument> {
    if (userId1 === userId2) {
      throw new BadRequestException('Un utilisateur ne peut pas avoir une conversation avec lui-même');
    }

    // Chercher une conversation privée existante
    const existingConversation = await this.conversationModel.findOne({
      type: ConversationType.Private,
      participant_ids: { $all: [userId1, userId2] }
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Créer une nouvelle conversation privée
    const newConversation = new this.conversationModel({
      participant_ids: [userId1, userId2],
      type: ConversationType.Private,
      messages: []
    });

    return await newConversation.save();
  }

  /**
   * Créer une conversation de groupe
   */
  async createGroupConversation(createConversationDto: CreateConversationDto): Promise<ConversationDocument> {
    if (createConversationDto.participant_ids.length < 3) {
      throw new BadRequestException('Une conversation de groupe doit avoir au moins 3 participants');
    }

    const newConversation = new this.conversationModel({
      participant_ids: createConversationDto.participant_ids,
      type: ConversationType.Group,
      name: createConversationDto.name,
      description: createConversationDto.description,
      avatar: createConversationDto.avatar,
      adminIds: createConversationDto.adminIds || [createConversationDto.participant_ids[0]],
      messages: []
    });

    return await newConversation.save();
  }

  /**
   * Créer ou récupérer une conversation d'événement
   */
  async findOrCreateEventConversation(eventId: string, eventTitle: string, eventIcon: string, participantIds: string[]): Promise<ConversationDocument> {
    // Chercher une conversation d'événement existante
    const existingConversation = await this.conversationModel.findOne({
      type: ConversationType.Group,
      eventId: eventId
    });

    if (existingConversation) {
      // Mettre à jour les participants si nécessaire
      const newParticipants = participantIds.filter(id => !existingConversation.participant_ids.includes(id));
      if (newParticipants.length > 0) {
        existingConversation.participant_ids.push(...newParticipants);
        existingConversation.updatedAt = new Date();
        await existingConversation.save();
      }
      return existingConversation;
    }

    // Créer une nouvelle conversation d'événement
    const newConversation = new this.conversationModel({
      participant_ids: participantIds,
      type: ConversationType.Group,
      name: `${eventTitle}`,
      description: `Discussion pour l'événement: ${eventTitle}`,
      eventId: eventId,
      eventIcon: eventIcon,
      adminIds: [participantIds[0]], // Le premier participant est admin par défaut
      messages: []
    });

    return await newConversation.save();
  }

  /**
   * Ajouter un message à une conversation
   */
  async addMessage(dto: CreateMessageInConversationDto): Promise<ConversationDocument> {
    const conversation = await this.conversationModel.findById(dto.conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (!conversation.participant_ids.includes(dto.senderId)) {
      throw new BadRequestException('Vous ne faites pas partie de cette conversation');
    }

    // Ajouter le message
    const newMessage = conversation.addMessage(dto.senderId, dto.content);
    await conversation.save();

    return conversation;
  }

  /**
   * Récupérer toutes les conversations d'un utilisateur
   */
  async getUserConversations(dto: GetConversationsDto) {
    const { userId, page = 1, limit = 50 } = dto;
    
    const skip = (page - 1) * limit;

    const conversations = await this.conversationModel
      .find({ 
        participant_ids: userId,
        deletedAt: { $exists: false }
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCount = await this.conversationModel.countDocuments({ 
      participant_ids: userId,
      deletedAt: { $exists: false }
    });

    return {
      conversations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Récupérer les messages d'une conversation avec pagination
   */
  async getConversationMessages(dto: GetConversationMessagesDto) {
    const { conversationId, userId, page = 1, limit = 50 } = dto;

    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (!conversation.participant_ids.includes(userId)) {
      throw new BadRequestException('Vous ne faites pas partie de cette conversation');
    }

    // Filtrer les messages non supprimés
    const activeMessages = conversation.messages.filter(msg => !msg.deletedAt);
    const totalCount = activeMessages.length;

    // Pagination (les messages les plus récents en premier)
    const startIndex = Math.max(0, totalCount - (page * limit));
    const endIndex = Math.max(0, totalCount - ((page - 1) * limit));
    
    const messages = activeMessages
      .slice(startIndex, endIndex)
      .reverse(); // Les plus récents en dernier

    return {
      conversation: {
        _id: conversation._id,
        participant_ids: conversation.participant_ids,
        type: conversation.type,
        name: conversation.name,
        description: conversation.description,
        avatar: conversation.avatar,
        adminIds: conversation.adminIds,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      },
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: startIndex > 0,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Marquer les messages comme lus
   */
  async markMessagesAsRead(dto: MarkMessagesAsReadDto): Promise<{ markedCount: number }> {
    const conversation = await this.conversationModel.findById(dto.conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (!conversation.participant_ids.includes(dto.userId)) {
      throw new BadRequestException('Vous ne faites pas partie de cette conversation');
    }

    const markedCount = conversation.markMessagesAsRead(dto.userId, dto.fromSenderId);
    await conversation.save();

    return { markedCount };
  }

  /**
   * Obtenir le nombre de messages non lus par conversation pour un utilisateur
   */
  async getUnreadCountsByUser(userId: string) {
    const conversations = await this.conversationModel
      .find({ 
        participant_ids: userId,
        deletedAt: { $exists: false }
      })
      .exec();

    const unreadCounts = conversations.map(conversation => ({
      conversationId: conversation._id,
      unreadCount: conversation.getUnreadCount(userId),
      lastMessage: conversation.getLastMessage()
    })).filter(item => item.unreadCount > 0);

    return unreadCounts;
  }

  /**
   * Obtenir le nombre total de messages non lus pour un utilisateur
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    const unreadCounts = await this.getUnreadCountsByUser(userId);
    return unreadCounts.reduce((total, item) => total + item.unreadCount, 0);
  }

  /**
   * Récupérer une conversation par ID
   */
  async findConversationById(conversationId: string, userId: string): Promise<ConversationDocument> {
    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Vérifier que l'utilisateur fait partie de la conversation
    if (!conversation.participant_ids.includes(userId)) {
      throw new BadRequestException('Vous ne faites pas partie de cette conversation');
    }

    return conversation;
  }

  /**
   * Ajouter des participants à une conversation de groupe
   */
  async addParticipants(conversationId: string, participantIds: string[], adminId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    if (conversation.type !== ConversationType.Group) {
      throw new BadRequestException('Vous ne pouvez ajouter des participants qu\'aux conversations de groupe');
    }

    // Vérifier que l'utilisateur est admin
    if (!conversation.adminIds?.includes(adminId)) {
      throw new BadRequestException('Seuls les administrateurs peuvent ajouter des participants');
    }

    // Ajouter les nouveaux participants
    const newParticipants = participantIds.filter(id => !conversation.participant_ids.includes(id));
    conversation.participant_ids.push(...newParticipants);
    conversation.updatedAt = new Date();

    return await conversation.save();
  }

  /**
   * Retirer des participants d'une conversation de groupe
   */
  async removeParticipants(conversationId: string, participantIds: string[], adminId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    if (conversation.type !== ConversationType.Group) {
      throw new BadRequestException('Vous ne pouvez retirer des participants que des conversations de groupe');
    }

    // Vérifier que l'utilisateur est admin
    if (!conversation.adminIds?.includes(adminId)) {
      throw new BadRequestException('Seuls les administrateurs peuvent retirer des participants');
    }

    // Retirer les participants
    conversation.participant_ids = conversation.participant_ids.filter(id => !participantIds.includes(id));
    conversation.updatedAt = new Date();

    return await conversation.save();
  }

  /**
   * Créer ou récupérer une conversation d'événement pour un utilisateur spécifique
   */
  async findOrCreateEventConversationForUser(eventId: string, eventTitle: string, userId: string): Promise<ConversationDocument> {
    try {
      // Récupérer les détails de l'événement
      const eventDetails = await this.eventService.getEventForConversation(eventId);
      
      // Vérifier que l'utilisateur fait partie des participants
      if (!eventDetails.participantIds.includes(userId)) {
        throw new BadRequestException('Vous devez participer à cet événement pour accéder à sa discussion');
      }
      
      // Utiliser la méthode existante pour créer/récupérer la conversation
      return await this.findOrCreateEventConversation(
        eventId,
        eventTitle,
        eventDetails.eventIcon,
        eventDetails.participantIds
      );
    } catch (error) {
      throw new BadRequestException(`Impossible d'accéder à la conversation de l'événement: ${error.message}`);
    }
  }
}