import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ConversationDocument = Conversation & Document;

export enum ConversationType {
  Private = 'private',
  Group = 'group',
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class MessageInConversation {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ required: true })
  senderId: string; // UUID de l'expéditeur

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const MessageInConversationSchema = SchemaFactory.createForClass(MessageInConversation);

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Conversation {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ required: true, type: [String] })
  participant_ids: string[]; // UUIDs des participants

  @Prop({ default: ConversationType.Private, enum: ConversationType })
  type: ConversationType;

  @Prop({ type: [MessageInConversationSchema], default: [] })
  messages: MessageInConversation[];

  // Métadonnées pour les groupes
  @Prop()
  name?: string; // Nom du groupe (optionnel pour les groupes)

  @Prop()
  description?: string; // Description du groupe

  @Prop()
  avatar?: string; // Avatar du groupe

  @Prop()
  adminIds?: string[]; // IDs des administrateurs (pour les groupes)

  @Prop()
  eventId?: string; // ID de l'événement (pour les conversations d'événement)

  @Prop()
  eventIcon?: string; // Icône de l'événement (pour les conversations d'événement)

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop()
  deletedAt?: Date;

  // Méthodes utilitaires
  isPrivateConversation(): boolean {
    return this.type === ConversationType.Private && this.participant_ids.length === 2;
  }

  isGroupConversation(): boolean {
    return this.type === ConversationType.Group;
  }

  getLastMessage(): MessageInConversation | null {
    if (this.messages.length === 0) return null;
    return this.messages[this.messages.length - 1];
  }

  getUnreadCount(userId: string): number {
    return this.messages.filter(msg => 
      msg.senderId !== userId && !msg.isRead && !msg.deletedAt
    ).length;
  }

  addMessage(senderId: string, content: string): MessageInConversation {
    const newMessage = new MessageInConversation();
    newMessage._id = uuidv4();
    newMessage.senderId = senderId;
    newMessage.content = content;
    newMessage.isRead = false;
    newMessage.createdAt = new Date();
    newMessage.updatedAt = new Date();
    
    this.messages.push(newMessage);
    this.updatedAt = new Date();
    
    return newMessage;
  }

  markMessagesAsRead(userId: string, fromSenderId?: string): number {
    let markedCount = 0;
    this.messages.forEach(msg => {
      if (msg.senderId !== userId && !msg.isRead && !msg.deletedAt) {
        if (!fromSenderId || msg.senderId === fromSenderId) {
          msg.isRead = true;
          msg.updatedAt = new Date();
          markedCount++;
        }
      }
    });
    
    if (markedCount > 0) {
      this.updatedAt = new Date();
    }
    
    return markedCount;
  }
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Ajouter les méthodes aux instances du schéma
ConversationSchema.methods.isPrivateConversation = function() {
  return this.type === ConversationType.Private && this.participant_ids.length === 2;
};

ConversationSchema.methods.isGroupConversation = function() {
  return this.type === ConversationType.Group;
};

ConversationSchema.methods.getLastMessage = function() {
  if (this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
};

ConversationSchema.methods.getUnreadCount = function(userId: string) {
  return this.messages.filter(msg => 
    msg.senderId !== userId && !msg.isRead && !msg.deletedAt
  ).length;
};

ConversationSchema.methods.addMessage = function(senderId: string, content: string) {
  const newMessage = {
    _id: uuidv4(),
    senderId,
    content,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.messages.push(newMessage);
  this.updatedAt = new Date();
  
  return newMessage;
};

ConversationSchema.methods.markMessagesAsRead = function(userId: string, fromSenderId?: string) {
  let markedCount = 0;
  this.messages.forEach(msg => {
    if (msg.senderId !== userId && !msg.isRead && !msg.deletedAt) {
      if (!fromSenderId || msg.senderId === fromSenderId) {
        msg.isRead = true;
        msg.updatedAt = new Date();
        markedCount++;
      }
    }
  });
  
  if (markedCount > 0) {
    this.updatedAt = new Date();
  }
  
  return markedCount;
};

// Index pour optimiser les requêtes
ConversationSchema.index({ participant_ids: 1 });
ConversationSchema.index({ type: 1 });
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ 'messages.senderId': 1, 'messages.isRead': 1 });
ConversationSchema.index({ eventId: 1 });