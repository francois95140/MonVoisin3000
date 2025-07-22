import { z } from 'zod';

// Validation schema for creating a new message
export const createMessageSchema = z.object({
    content: z.string().min(1, 'Le contenu du message est requis'),
    senderId: z.string().uuid('L\'identifiant de l\'expéditeur doit être un UUID valide'),
    receiverId: z.string().uuid('L\'identifiant du destinataire doit être un UUID valide'),
});

// Validation schema for updating a message
export const updateMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid('L\'identifiant du message doit être un UUID valide'),
  }),
  body: z.object({
    content: z.string().min(1, 'Le contenu du message est requis').optional(),
    isRead: z.boolean().optional(),
    attachments: z.array(z.string().url('L\'URL de la pièce jointe doit être valide')).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  }),
});

// Validation schema for deleting a message
export const deleteMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid('L\'identifiant du message doit être un UUID valide'),
  }),
});

// Validation schema for getting a message by ID
export const getMessageByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('L\'identifiant du message doit être un UUID valide'),
  }),
});

// Validation schema for getting messages by conversation ID
export const getMessagesByConversationSchema = z.object({
  params: z.object({
    conversationId: z.string().uuid('L\'identifiant de la conversation doit être un UUID valide'),
  }),
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});