import { z } from 'zod';

export const createMessageSchema = z.object({
  senderId: z.string().uuid('L\'identifiant de l\'expéditeur doit être un UUID valide'),
  recipientId: z.string().uuid('L\'identifiant du destinataire doit être un UUID valide'),
  content: z.string().min(1, 'Le contenu du message est requis').max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
});

export type CreateMessageDto = z.infer<typeof createMessageSchema>;
