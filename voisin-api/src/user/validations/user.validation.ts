import { z } from 'zod';
import { UserRole } from '../entities/user.entity';

export const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères'),
  email: z.string()
    .email('Email invalide')
    .min(5, 'L\'email doit contenir au moins 5 caractères')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  fullName: z.string().optional(),
  avatar: z.string().url('L\'URL de l\'avatar est invalide').optional(),
  bio: z.string().max(500, 'La bio ne peut pas dépasser 500 caractères').optional(),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide')
    .optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().length(2, 'Le code de langue doit faire 2 caractères').optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const loginUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const resetPasswordUserSchema = z.object({
  passwordResetCode: z.string(),
  newPassword: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),

});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Le terme de recherche est requis'),
  ...paginationSchema.shape,
});

export const toggleStatusSchema = z.object({
  isActive: z.boolean({
    required_error: 'Le statut est requis',
    invalid_type_error: 'Le statut doit être un booléen',
  }),
});

export const updateRoleSchema = z.object({
  role: z.enum([UserRole.USER, UserRole.ADMIN], {
    required_error: 'Le rôle est requis',
    invalid_type_error: 'Rôle invalide',
  }),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  notifications: z.boolean().optional(),
  language: z.string().length(2).optional(),
  emailNotifications: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Au moins une préférence doit être spécifiée',
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type ResetPasswordUserInput = z.infer<typeof resetPasswordUserSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type ToggleStatusInput = z.infer<typeof toggleStatusSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>; 