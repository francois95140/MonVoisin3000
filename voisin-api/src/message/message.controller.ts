import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Envoyer un nouveau message
   */
  @Post()
  async create(@Body() createMessageDto: CreateMessageDto) {
    try {
      const message = await this.messageService.create(createMessageDto);
      return {
        success: true,
        data: message,
        message: 'Message envoyé avec succès',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Récupérer tous les messages d'une conversation
   */
  @Get('conversation/:userId1/:userId2')
  async getConversation(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    try {
      const result = await this.messageService.getConversationMessages(
        userId1,
        userId2,
        parseInt(page),
        parseInt(limit),
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Récupérer un message spécifique
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const message = await this.messageService.findOne(id);
      return {
        success: true,
        data: message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Modifier un message
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Body('userId') userId: string,
  ) {
    try {
      const message = await this.messageService.update(
        id,
        updateMessageDto,
        userId,
      );
      return {
        success: true,
        data: message,
        message: 'Message modifié avec succès',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Supprimer un message
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Body('userId') userId: string) {
    try {
      const result = await this.messageService.remove(id, userId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Marquer un message comme lu
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Body('userId') userId: string) {
    try {
      const message = await this.messageService.markAsRead(id, userId);
      return {
        success: true,
        data: message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Récupérer les messages non lus
   */
  @Get('unread/:userId')
  async getUnreadMessages(@Param('userId') userId: string) {
    try {
      const messages = await this.messageService.getUnreadMessages(userId);
      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Compter les messages non lus
   */
  @Get('unread-count/:userId')
  async getUnreadCount(@Param('userId') userId: string) {
    try {
      const count = await this.messageService.getUnreadCount(userId);
      return {
        success: true,
        data: { count },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Compter les messages non lus dans une conversation spécifique
   */
  @Get('unread-count/:userId/:fromUserId')
  async getUnreadCountByConversation(
    @Param('userId') userId: string,
    @Param('fromUserId') fromUserId: string,
  ) {
    try {
      const count = await this.messageService.getUnreadCountByConversation(userId, fromUserId);
      return {
        success: true,
        data: { count },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Récupérer la liste des conversations avec le nombre de messages non lus
   */
  @Get('conversations-unread/:userId')
  async getConversationsWithUnreadCount(@Param('userId') userId: string) {
    try {
      const conversations = await this.messageService.getConversationsWithUnreadCount(userId);
      return {
        success: true,
        data: conversations,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Marquer tous les messages d'une conversation comme lus
   */
  @Patch('conversation/:userId/:fromUserId/read')
  async markConversationAsRead(
    @Param('userId') userId: string,
    @Param('fromUserId') fromUserId: string,
  ) {
    try {
      const result = await this.messageService.markConversationAsRead(userId, fromUserId);
      return {
        success: true,
        data: result,
        message: 'Messages marqués comme lus',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Récupérer tous les IDs d'utilisateurs avec qui on a eu des conversations
   */
  @Get('conversation-participants/:userId')
  async getConversationParticipants(@Param('userId') userId: string) {
    try {
      const participants = await this.messageService.getConversationParticipants(userId);
      return {
        success: true,
        data: participants,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}