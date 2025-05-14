import { z } from 'zod';
import { ServiceType } from '../service.entity';
import { ApiProperty } from '@nestjs/swagger';
import { createServiceSchema } from './create-service.dto';

// Zod schema for validation
export const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export class UpdateServiceDto {
  @ApiProperty({ description: 'Service title', required: false, maxLength: 100 })
  title?: string;

  @ApiProperty({ description: 'Service description', required: false })
  description?: string;

  @ApiProperty({ 
    description: 'Service type', 
    enum: ServiceType,
    required: false
  })
  type?: ServiceType;

  @ApiProperty({ description: 'Item being offered', required: false })
  itemOffered?: string;

  @ApiProperty({ description: 'Item wanted in exchange', required: false })
  itemWanted?: string;

  @ApiProperty({ description: 'URL to service image', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Whether the service is active', required: false })
  isActive?: boolean;
}

export type UpdateServiceDtoType = z.infer<typeof updateServiceSchema>;