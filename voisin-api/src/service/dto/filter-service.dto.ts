import { z } from 'zod';
import { ServiceType } from '../entities/service.entity';
import { ApiProperty } from '@nestjs/swagger';

// Zod schema for validation
export const filterServiceSchema = z.object({
  type: z.nativeEnum(ServiceType).optional(),
  title: z.string().optional(),
  itemWanted: z.string().optional(),
  itemOffered: z.string().optional(),
  isCompleted: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => {
    const parsed = val ? parseInt(val, 10) : 10;
    return parsed > 50 ? 50 : parsed;
  }),
});

export class FilterServiceDto {
  @ApiProperty({ description: 'Filter by service type', enum: ServiceType, required: false })
  type?: ServiceType;

  @ApiProperty({ description: 'Filter by title (partial match)', required: false })
  title?: string;

  @ApiProperty({ description: 'Filter by wanted item (partial match)', required: false })
  itemWanted?: string;

  @ApiProperty({ description: 'Filter by offered item (partial match)', required: false })
  itemOffered?: string;

  @ApiProperty({ description: 'Filter by completion status', enum: ['true', 'false'], required: false })
  isCompleted?: boolean;

  @ApiProperty({ description: 'Page number for pagination', required: false, default: 1 })
  page?: number;

  @ApiProperty({ description: 'Number of items per page', required: false, default: 10, maximum: 50 })
  limit?: number;
}

export type FilterServiceDtoType = z.infer<typeof filterServiceSchema>;