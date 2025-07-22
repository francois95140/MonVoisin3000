import { z } from 'zod';

// Validation schema for creating a new event
export const createEventSchema = z.object({
    titre: z.string().min(1, 'Le titre est requis').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    description: z.string().min(1, 'La description est requise'),
    startDate: z.string().datetime('La date de début doit être une date valide').transform((str) => new Date(str)),
    endDate: z.string().datetime('La date de fin doit être une date valide').transform((str) => new Date(str)),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'L\'heure de début doit être au format HH:MM'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'L\'heure de fin doit être au format HH:MM'),
    location: z.string().min(1, 'La rue est requise').max(255, 'La rue ne peut pas dépasser 255 caractères'),
    imageUrl: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;


// Validation schema for updating an event
export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().uuid('L\'identifiant de l\'événement doit être un UUID valide'),
  }),
  body: z.object({
    titre: z.string().min(1, 'Le titre est requis').max(100, 'Le titre ne peut pas dépasser 100 caractères').optional(),
    description: z.string().min(1, 'La description est requise').optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'La date de l\'événement doit être une date valide',
    }).optional(),
    heureDebut: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'L\'heure de début doit être au format HH:MM').optional(),
    heureFin: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'L\'heure de fin doit être au format HH:MM').optional(),
    location: z.string().min(1, 'La rue est requise').max(255, 'La rue ne peut pas dépasser 255 caractères').optional(),
    imageUrl: z.string().optional(),
    participants: z.array(z.string().uuid('Les identifiants des participants doivent être des UUID valides')).optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'Au moins un champ doit être fourni pour la mise à jour',
  }),
});

// Validation schema for deleting an event
export const deleteEventSchema = z.object({
  params: z.object({
    id: z.string().uuid('L\'identifiant de l\'événement doit être un UUID valide'),
  }),
});

// Validation schema for getting an event by ID
export const getEventByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('L\'identifiant de l\'événement doit être un UUID valide'),
  }),
});

// Validation schema for getting events with pagination and filters
export const getEventsSchema = z.object({
  query: z.object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
    createdBy: z.string().uuid('L\'identifiant du créateur doit être un UUID valide').optional(),
    isPublic: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
    fromDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'La date de début doit être une date valide',
    }).optional(),
    toDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'La date de fin doit être une date valide',
    }).optional(),
  }).optional(),
});

// Validation schema for adding participants to an event
export const addParticipantsSchema = z.object({
  params: z.object({
    id: z.string().uuid('L\'identifiant de l\'événement doit être un UUID valide'),
  }),
  body: z.object({
    participants: z.array(z.string().uuid('Les identifiants des participants doivent être des UUID valides')),
  }),
});

// Validation schema for removing participants from an event
export const removeParticipantsSchema = z.object({
  params: z.object({
    id: z.string().uuid('L\'identifiant de l\'événement doit être un UUID valide'),
    userId: z.string().uuid('L\'identifiant de l\'utilisateur doit être un UUID valide'),
  }),
});