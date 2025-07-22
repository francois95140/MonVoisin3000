import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type MessageDocument = Message & Document;

export enum MessageType {
  Private = 'private',
  Group = 'group',
}

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class Message {
  @Prop({ type: String, default: () => uuidv4() })
  _id: string;

  @Prop({ required: true })
  senderId: string; // UUID de l'expéditeur

  @Prop({ required: true })
  recipientId: string; // UUID du destinataire (conversation privée)

  @Prop({ required: true })
  content: string;

  @Prop({ default: MessageType.Private, enum: MessageType })
  type: MessageType;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  // Méthode pour vérifier si le message peut être modifié (dans les 2 minutes)
  canBeModified(): boolean {
    if (!this.createdAt) return false;
    const now = new Date();
    const createdTime = new Date(this.createdAt);
    const diffInMinutes = (now.getTime() - createdTime.getTime()) / (1000 * 60);
    return diffInMinutes <= 2;
  }
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Ajouter la méthode à l'instance du schéma
MessageSchema.methods.canBeModified = function() {
  if (!this.createdAt) return false;
  const now = new Date();
  const createdTime = new Date(this.createdAt);
  const diffInMinutes = (now.getTime() - createdTime.getTime()) / (1000 * 60);
  return diffInMinutes <= 2;
};
