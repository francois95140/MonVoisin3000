import { z } from 'zod';

export const updateMessageSchema = z.object({
  id: z.string().uuid('L\'identifiant du message doit être un UUID valide'),
  content: z.string().min(1, 'Le contenu du message est requis').max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
});

export type UpdateMessageDto = z.infer<typeof updateMessageSchema>;

