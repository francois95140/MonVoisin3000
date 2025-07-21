import { z } from 'zod';
import { ServiceType } from '../service.entity';
import { ApiProperty } from '@nestjs/swagger';

// Zod schema for validation
export const createServiceSchema = z.object({
  title: z.string().max(100),
  description: z.string(),
  type: z.nativeEnum(ServiceType),
  itemOffered: z.string().optional(),
  itemWanted: z.string().optional(),
  imageUrl: z.string().optional(),
});

export class CreateServiceDto {
  @ApiProperty({ description: 'Service title', maxLength: 100 })
  title: string;

  @ApiProperty({ description: 'Service description' })
  description: string;

  @ApiProperty({ 
    description: 'Service type', 
    enum: ServiceType,
    example: ServiceType.HELP
  })
  type: ServiceType;

  @ApiProperty({ description: 'Item being offered', required: false })
  itemOffered?: string;

  @ApiProperty({ description: 'Item wanted in exchange', required: false })
  itemWanted?: string;

  @ApiProperty({ description: 'URL to service image', required: false })
  imageUrl?: string;
}

export type CreateServiceDtoType = z.infer<typeof createServiceSchema>;