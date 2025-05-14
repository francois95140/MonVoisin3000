import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { FilterServiceDto } from './dto/filter-service.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

// Add pagination interface
interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async findAll(filters?: FilterServiceDto): Promise<PaginatedResult<Service>> {
    const { page = 1, limit = 10 } = filters || {};
    const queryBuilder = this.serviceRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.creator', 'creator')
      .leftJoinAndSelect('service.provider', 'provider')
      // Only include non-deleted services by default
      .where('service.deletedAt IS NULL');
    
    if (filters) {
      if (filters.type) {
        queryBuilder.andWhere('service.type = :type', { type: filters.type });
      }
      
      if (filters.title) {
        queryBuilder.andWhere('service.title LIKE :title', { title: `%${filters.title}%` });
      }
      
      if (filters.itemWanted) {
        queryBuilder.andWhere('service.itemWanted LIKE :itemWanted', { itemWanted: `%${filters.itemWanted}%` });
      }
      
      if (filters.itemOffered) {
        queryBuilder.andWhere('service.itemOffered LIKE :itemOffered', { itemOffered: `%${filters.itemOffered}%` });
      }
      
      // Filter by completion status
      if (filters.isCompleted !== undefined) {
        if (filters.isCompleted) {
          queryBuilder.andWhere('service.fulfilledBy IS NOT NULL');
        } else {
          queryBuilder.andWhere('service.fulfilledBy IS NULL');
        }
      }
    }
    
    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Get total count for pagination metadata
    const total = await queryBuilder.getCount();
    
    // Apply pagination
    queryBuilder.skip(skip).take(limit);
    
    // Execute query
    const items = await queryBuilder.getMany();
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    // Return paginated result
    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['creator', 'provider'],
    });
    
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    
    return service;
  }

  async create(createServiceDto: CreateServiceDto, userId: string): Promise<Service> {
    const service = this.serviceRepository.create({
      ...createServiceDto,
      createdBy: userId,
    });
    
    return this.serviceRepository.save(service);
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    let service = await this.findOne(id);
    
    // Check if the service has already been assigned to a provider
    if (service.fulfilledBy) {
      throw new Error('Cannot update a service that has already been assigned to a provider');
    }
    
    service = { ...service, ...updateServiceDto };
    
    return this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceRepository.softDelete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }

  async assignProvider(id: string, providerId: string): Promise<Service> {
    const service = await this.findOne(id);
    
    service.fulfilledBy = providerId;
    
    return this.serviceRepository.save(service);
  }


  async findByUser(userId: string): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { createdBy: userId },
      relations: ['creator', 'provider'],
    });
  }

  async findProvidedByUser(userId: string): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { fulfilledBy: userId },
      relations: ['creator', 'provider'],
    });
  }
}