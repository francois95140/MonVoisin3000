import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket,
  WebSocketServer 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: "*"
  },
})
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  // Map pour tracker les utilisateurs connectés
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly messageService: MessageService) {}

  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const message = await this.messageService.create(createMessageDto);
      
      // Émettre le message au destinataire s'il est connecté
      this.server.to(`user_${createMessageDto.recipientId}`).emit('newMessage', message);
      
      return {
        success: true,
        data: message,
        message: 'Message envoyé avec succès'
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
    @MessageBody() data: { userId1: string; userId2: string; page?: number; limit?: number },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const result = await this.messageService.getConversationMessages(
        data.userId1,
        data.userId2,
        data.page || 1,
        data.limit || 50
      );
      
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

  @SubscribeMessage('findOneMessage')
  async findOne(
    @MessageBody() data: { id: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const message = await this.messageService.findOne(data.id);
      return {
        success: true,
        data: message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('updateMessage')
  async update(
    @MessageBody() data: { id: string; content: string; userId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const updateDto: UpdateMessageDto = {
        id: data.id,
        content: data.content
      };
      
      const updatedMessage = await this.messageService.update(
        data.id,
        updateDto,
        data.userId
      );
      
      // Notifier les participants de la conversation
      this.server.to(`user_${updatedMessage.recipientId}`).emit('messageUpdated', updatedMessage);
      this.server.to(`user_${updatedMessage.senderId}`).emit('messageUpdated', updatedMessage);
      
      return {
        success: true,
        data: updatedMessage,
        message: 'Message modifié avec succès'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('removeMessage')
  async remove(
    @MessageBody() data: { id: string; userId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const result = await this.messageService.remove(data.id, data.userId);
      
      // Notifier les participants de la conversation
      const message = await this.messageService.findOne(data.id).catch(() => null);
      if (message) {
        this.server.to(`user_${message.recipientId}`).emit('messageDeleted', { id: data.id });
        this.server.to(`user_${message.senderId}`).emit('messageDeleted', { id: data.id });
      }
      
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

  @SubscribeMessage('markAsRead')
  async markAsRead(
    @MessageBody() data: { id: string; userId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const message = await this.messageService.markAsRead(data.id, data.userId);
      
      // Notifier l'expéditeur que le message a été lu
      this.server.to(`user_${message.senderId}`).emit('messageRead', { id: data.id });
      
      return {
        success: true,
        data: message
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('getUnreadMessages')
  async getUnreadMessages(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const messages = await this.messageService.getUnreadMessages(data.userId);
      return {
        success: true,
        data: messages
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  @SubscribeMessage('getUnreadCount')
  async getUnreadCount(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    try {
      const count = await this.messageService.getUnreadCount(data.userId);
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
