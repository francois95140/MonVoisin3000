import { z } from 'zod';
import { ConversationType } from '../entities/conversation.entity';

export const createConversationSchema = z.object({
  participant_ids: z.array(z.string().uuid('Chaque participant doit avoir un UUID valide')).min(2, 'Au moins 2 participants sont requis'),
  type: z.nativeEnum(ConversationType).optional().default(ConversationType.Private),
  name: z.string().optional(),
  description: z.string().optional(),
  avatar: z.string().optional(),
  adminIds: z.array(z.string().uuid('Chaque admin doit avoir un UUID valide')).optional(),
});

export const createMessageInConversationSchema = z.object({
  conversationId: z.string().uuid('L\'identifiant de conversation doit être un UUID valide'),
  senderId: z.string().uuid('L\'identifiant de l\'expéditeur doit être un UUID valide'),
  content: z.string().min(1, 'Le contenu du message est requis').max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
});

export const getConversationsSchema = z.object({
  userId: z.string().uuid('L\'identifiant utilisateur doit être un UUID valide'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50),
});

export const getConversationMessagesSchema = z.object({
  conversationId: z.string().uuid('L\'identifiant de conversation doit être un UUID valide'),
  userId: z.string().uuid('L\'identifiant utilisateur doit être un UUID valide'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(50),
});

export const markMessagesAsReadSchema = z.object({
  conversationId: z.string().uuid('L\'identifiant de conversation doit être un UUID valide'),
  userId: z.string().uuid('L\'identifiant utilisateur doit être un UUID valide'),
  fromSenderId: z.string().uuid('L\'identifiant de l\'expéditeur doit être un UUID valide').optional(),
});

export type CreateConversationDto = z.infer<typeof createConversationSchema>;
export type CreateMessageInConversationDto = z.infer<typeof createMessageInConversationSchema>;
export type GetConversationsDto = z.infer<typeof getConversationsSchema>;
export type GetConversationMessagesDto = z.infer<typeof getConversationMessagesSchema>;
export type MarkMessagesAsReadDto = z.infer<typeof markMessagesAsReadSchema>;