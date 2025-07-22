import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMessageDto, createMessageSchema } from './dto/create-message.dto';
import { UpdateMessageDto, updateMessageSchema } from './dto/update-message.dto';
import { Message, MessageDocument } from './entities/message.entity';
import { z } from 'zod';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Envoyer un nouveau message
   */
  async create(createMessageDto: CreateMessageDto): Promise<MessageDocument> {
    try {
      // Validation avec Zod
      const validatedData = createMessageSchema.parse(createMessageDto);
      
      const newMessage = new this.messageModel(validatedData);
      return await newMessage.save();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Données de validation invalides',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  /**
   * Récupérer tous les messages d'une conversation entre deux utilisateurs
   */
  async getConversationMessages(
    userId1: string,
    userId2: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: MessageDocument[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;
    
    const query = {
      $or: [
        { senderId: userId1, recipientId: userId2 },
        { senderId: userId2, recipientId: userId1 },
      ],
      deletedAt: { $exists: false },
    };

    const [messages, total] = await Promise.all([
      this.messageModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.messageModel.countDocuments(query),
    ]);

    return {
      messages: messages.reverse(), // Inverser pour avoir l'ordre chronologique
      total,
      hasMore: skip + messages.length < total,
    };
  }

  /**
   * Récupérer un message spécifique
   */
  async findOne(id: string): Promise<MessageDocument> {
    const message = await this.messageModel.findById(id).exec();
    if (!message || message.deletedAt) {
      throw new NotFoundException('Message non trouvé');
    }
    return message;
  }

  /**
   * Modifier un message (seulement dans les 2 minutes après l'envoi)
   */
  async update(id: string, updateMessageDto: UpdateMessageDto, userId: string): Promise<MessageDocument> {
    try {
      // Validation avec Zod
      const validatedData = updateMessageSchema.parse({...updateMessageDto });
      
      const message = await this.findOne(id);
      
      // Vérifier que l'utilisateur est l'expéditeur du message
      if (message.senderId !== userId) {
        throw new ForbiddenException('Vous ne pouvez modifier que vos propres messages');
      }
      
      // Vérifier si le message peut encore être modifié (2 minutes)
      if (!message.canBeModified()) {
        throw new ForbiddenException('Le message ne peut plus être modifié (délai de 2 minutes dépassé)');
      }
      
      message.content = validatedData.content;
      message.updatedAt = new Date();
      
      return await message.save();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          message: 'Données de validation invalides',
          errors: error.errors,
        });
      }
      throw error;
    }
  }

  /**
   * Supprimer un message (soft delete)
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const message = await this.findOne(id);
    
    // Vérifier que l'utilisateur est l'expéditeur du message
    if (message.senderId !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres messages');
    }
    
    message.deletedAt = new Date();
    await message.save();
    
    return { message: 'Message supprimé avec succès' };
  }

  /**
   * Marquer un message comme lu
   */
  async markAsRead(id: string, userId: string): Promise<MessageDocument> {
    const message = await this.findOne(id);
    
    // Seul le destinataire peut marquer le message comme lu
    if (message.recipientId !== userId) {
      throw new ForbiddenException('Vous ne pouvez marquer comme lu que les messages qui vous sont destinés');
    }
    
    message.isRead = true;
    return await message.save();
  }

  /**
   * Récupérer les messages non lus pour un utilisateur
   */
  async getUnreadMessages(userId: string): Promise<MessageDocument[]> {
    return await this.messageModel
      .find({
        recipientId: userId,
        isRead: false,
        deletedAt: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Compter les messages non lus pour un utilisateur
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.messageModel.countDocuments({
      recipientId: userId,
      isRead: false,
      deletedAt: { $exists: false },
    });
  }
}
