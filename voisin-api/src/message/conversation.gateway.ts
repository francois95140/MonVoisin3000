import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket,
  WebSocketServer 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationService } from './conversation.service';
import { CreateMessageInConversationDto } from './dto/create-conversation.dto';
import { EventService } from '../event/event.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: "*"
  },
})
export class ConversationGateway {
  @WebSocketServer()
  server: Server;

  // Map pour tracker les utilisateurs connectés
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly conversationService: ConversationService,
    private readonly eventService: EventService
  ) {}

  @SubscribeMessage('createMessageInConversation')
  async createMessage(
    @MessageBody() data: CreateMessageInConversationDto,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const conversation = await this.conversationService.addMessage(data);
      const newMessage = conversation.messages[conversation.messages.length - 1];

      // Émettre le message à tous les participants de la conversation
      conversation.participant_ids.forEach(participantId => {
        if (participantId !== data.senderId) {
          this.server.to(`user_${participantId}`).emit('newMessageInConversation', {
            conversationId: conversation._id,
            message: newMessage,
            conversation: {
              _id: conversation._id,
              participant_ids: conversation.participant_ids,
              type: conversation.type,
              name: conversation.name,
              updatedAt: conversation.updatedAt
            }
          });
        }
      });

      return {
        success: true,
        data: {
          conversationId: conversation._id,
          message: newMessage
        },
        message: 'Message créé avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('getConversation')
  async getConversation(
    @MessageBody() data: { conversationId: string; page?: number; limit?: number },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.userId) {
        return {
          success: false,
          error: 'Utilisateur non authentifié'
        };
      }

      const result = await this.conversationService.getConversationMessages({
        conversationId: data.conversationId,
        userId: client.userId,
        page: data.page || 1,
        limit: data.limit || 50
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('getUserConversations')
  async getUserConversations(
    @MessageBody() data: { page?: number; limit?: number },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.userId) {
        return {
          success: false,
          error: 'Utilisateur non authentifié'
        };
      }

      const result = await this.conversationService.getUserConversations({
        userId: client.userId,
        page: data.page || 1,
        limit: data.limit || 50
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('markConversationAsRead')
  async markAsRead(
    @MessageBody() data: { conversationId: string; fromSenderId?: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.userId) {
        return {
          success: false,
          error: 'Utilisateur non authentifié'
        };
      }

      const result = await this.conversationService.markMessagesAsRead({
        conversationId: data.conversationId,
        userId: client.userId,
        fromSenderId: data.fromSenderId
      });
      
      // Notifier les autres participants que les messages ont été lus
      const conversation = await this.conversationService.findConversationById(
        data.conversationId, 
        client.userId
      );
      
      conversation.participant_ids.forEach(participantId => {
        if (participantId !== client.userId) {
          this.server.to(`user_${participantId}`).emit('messagesMarkedAsRead', {
            conversationId: data.conversationId,
            userId: client.userId,
            markedCount: result.markedCount
          });
        }
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('getUnreadCounts')
  async getUnreadCounts(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.userId) {
        return {
          success: false,
          error: 'Utilisateur non authentifié'
        };
      }

      const unreadCounts = await this.conversationService.getUnreadCountsByUser(client.userId);
      return {
        success: true,
        data: unreadCounts
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('getTotalUnreadCount')
  async getTotalUnreadCount(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.userId) {
        return {
          success: false,
          error: 'Utilisateur non authentifié'
        };
      }

      const count = await this.conversationService.getTotalUnreadCount(client.userId);
      return {
        success: true,
        data: { count }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('createOrGetPrivateConversation')
  async createOrGetPrivateConversation(
    @MessageBody() data: { otherUserId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.userId) {
        return {
          success: false,
          error: 'Utilisateur non authentifié'
        };
      }

      const conversation = await this.conversationService.findOrCreatePrivateConversation(
        client.userId,
        data.otherUserId
      );
      
      return {
        success: true,
        data: conversation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('createOrGetEventConversation')
  async createOrGetEventConversation(
    @MessageBody() data: { eventId: string; eventTitle: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      if (!client.userId) {
        return {
          success: false,
          error: 'Utilisateur non authentifié'
        };
      }

      // Récupérer tous les participants de l'événement et son icône
      const eventDetails = await this.eventService.getEventForConversation(data.eventId);

      // Vérifier que l'utilisateur actuel fait partie des participants
      if (!eventDetails.participantIds.includes(client.userId)) {
        return {
          success: false,
          error: 'Vous devez participer à cet événement pour accéder à sa discussion'
        };
      }

      const conversation = await this.conversationService.findOrCreateEventConversation(
        data.eventId,
        data.eventTitle,
        eventDetails.eventIcon,
        eventDetails.participantIds
      );
      
      return {
        success: true,
        data: conversation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Gestion des connexions
  handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client déconnecté: ${client.id}`);
    if (client.userId) {
      client.leave(`user_${client.userId}`);
      // Supprimer l'utilisateur de la liste des connectés
      this.connectedUsers.delete(client.userId);
      console.log(`👋 Utilisateur ${client.userId} maintenant hors ligne`);
      
      // Notifier les autres utilisateurs du changement de statut
      this.server.emit('userStatusChanged', {
        userId: client.userId,
        isOnline: false
      });
    }
  }

  // Méthode pour joindre un utilisateur à sa room
  @SubscribeMessage('joinUserRoom')
  handleJoinRoom(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    client.userId = data.userId;
    client.join(`user_${data.userId}`);
    
    // Ajouter l'utilisateur à la liste des connectés
    this.connectedUsers.set(data.userId, client.id);
    console.log(`✅ Utilisateur ${data.userId} maintenant en ligne`);
    
    // Notifier les autres utilisateurs du changement de statut
    this.server.emit('userStatusChanged', {
      userId: data.userId,
      isOnline: true
    });
    
    return {
      success: true,
      message: `Utilisateur ${data.userId} rejoint sa room`
    };
  }

  // Méthode pour vérifier le statut d'un utilisateur
  @SubscribeMessage('getUserStatus')
  getUserStatus(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const isOnline = this.connectedUsers.has(data.userId);
    return {
      success: true,
      data: { userId: data.userId, isOnline }
    };
  }

  // Méthode pour récupérer les statuts de plusieurs utilisateurs
  @SubscribeMessage('getUsersStatus')
  getUsersStatus(
    @MessageBody() data: { userIds: string[] },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const statuses = data.userIds.map(userId => ({
      userId,
      isOnline: this.connectedUsers.has(userId)
    }));
    
    return {
      success: true,
      data: statuses
    };
  }
}