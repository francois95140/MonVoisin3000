import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  Patch,
  UseGuards,
  Request
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { 
  CreateConversationDto, 
  CreateMessageInConversationDto,
  GetConversationsDto,
  GetConversationMessagesDto,
  MarkMessagesAsReadDto
} from './dto/create-conversation.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/conversations')
@UseGuards(AuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  /**
   * Créer ou récupérer une conversation privée
   */
  @Post('private')
  async findOrCreatePrivateConversation(
    @Body() body: { otherUserId: string },
    @Request() req
  ) {
    try {
      const currentUserId = req.user.id;
      const conversation = await this.conversationService.findOrCreatePrivateConversation(
        currentUserId, 
        body.otherUserId
      );

      return {
        success: true,
        data: conversation,
        message: 'Conversation récupérée avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Créer une conversation de groupe
   */
  @Post('group')
  async createGroupConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req
  ) {
    try {
      // S'assurer que l'utilisateur actuel est dans la liste des participants
      if (!createConversationDto.participant_ids.includes(req.user.id)) {
        createConversationDto.participant_ids.push(req.user.id);
      }

      const conversation = await this.conversationService.createGroupConversation(createConversationDto);

      return {
        success: true,
        data: conversation,
        message: 'Conversation de groupe créée avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Ajouter un message à une conversation
   */
  @Post('message')
  async addMessage(
    @Body() createMessageDto: CreateMessageInConversationDto,
    @Request() req
  ) {
    try {
      // S'assurer que le senderId correspond à l'utilisateur connecté
      createMessageDto.senderId = req.user.id;

      const conversation = await this.conversationService.addMessage(createMessageDto);

      return {
        success: true,
        data: {
          conversationId: conversation._id,
          message: conversation.messages[conversation.messages.length - 1]
        },
        message: 'Message ajouté avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer toutes les conversations de l'utilisateur
   */
  @Get()
  async getUserConversations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Request() req
  ) {
    try {
      const dto: GetConversationsDto = {
        userId: req.user.id,
        page: Number(page),
        limit: Number(limit)
      };

      const result = await this.conversationService.getUserConversations(dto);

      return {
        success: true,
        data: result,
        message: 'Conversations récupérées avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les messages d'une conversation
   */
  @Get(':conversationId/messages')
  async getConversationMessages(
    @Param('conversationId') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Request() req
  ) {
    try {
      const dto: GetConversationMessagesDto = {
        conversationId,
        userId: req.user.id,
        page: Number(page),
        limit: Number(limit)
      };

      const result = await this.conversationService.getConversationMessages(dto);

      return {
        success: true,
        data: result,
        message: 'Messages récupérés avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Marquer les messages comme lus
   */
  @Patch(':conversationId/read')
  async markMessagesAsRead(
    @Param('conversationId') conversationId: string,
    @Body() body: { fromSenderId?: string },
    @Request() req
  ) {
    try {
      const dto: MarkMessagesAsReadDto = {
        conversationId,
        userId: req.user.id,
        fromSenderId: body.fromSenderId
      };

      const result = await this.conversationService.markMessagesAsRead(dto);

      return {
        success: true,
        data: result,
        message: 'Messages marqués comme lus'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtenir le nombre de messages non lus par conversation
   */
  @Get('unread-counts')
  async getUnreadCounts(@Request() req) {
    try {
      const unreadCounts = await this.conversationService.getUnreadCountsByUser(req.user.id);

      return {
        success: true,
        data: unreadCounts,
        message: 'Compteurs de messages non lus récupérés'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtenir le nombre total de messages non lus
   */
  @Get('unread-total')
  async getTotalUnreadCount(@Request() req) {
    try {
      const totalCount = await this.conversationService.getTotalUnreadCount(req.user.id);

      return {
        success: true,
        data: { count: totalCount },
        message: 'Nombre total de messages non lus récupéré'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer une conversation par ID
   */
  @Get(':conversationId')
  async getConversationById(
    @Param('conversationId') conversationId: string,
    @Request() req
  ) {
    try {
      const conversation = await this.conversationService.findConversationById(
        conversationId, 
        req.user.id
      );

      return {
        success: true,
        data: conversation,
        message: 'Conversation récupérée avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Ajouter des participants à une conversation de groupe
   */
  @Post(':conversationId/participants')
  async addParticipants(
    @Param('conversationId') conversationId: string,
    @Body() body: { participantIds: string[] },
    @Request() req
  ) {
    try {
      const conversation = await this.conversationService.addParticipants(
        conversationId,
        body.participantIds,
        req.user.id
      );

      return {
        success: true,
        data: conversation,
        message: 'Participants ajoutés avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retirer des participants d'une conversation de groupe
   */
  @Patch(':conversationId/participants/remove')
  async removeParticipants(
    @Param('conversationId') conversationId: string,
    @Body() body: { participantIds: string[] },
    @Request() req
  ) {
    try {
      const conversation = await this.conversationService.removeParticipants(
        conversationId,
        body.participantIds,
        req.user.id
      );

      return {
        success: true,
        data: conversation,
        message: 'Participants retirés avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}