import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UsePipes, Query } from '@nestjs/common';
import { ServiceService } from './service.service';
import { createServiceSchema, CreateServiceDto } from './dto/create-service.dto';
import { updateServiceSchema, UpdateServiceDto } from './dto/update-service.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { filterServiceSchema, FilterServiceDto } from './dto/filter-service.dto';
import { Service } from './entities/service.entity';
import { User } from 'src/user/entities/user.entity';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: 201, description: 'Service successfully created', type: Service })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UsePipes(new ZodValidationPipe(createServiceSchema))
  create(@Body() createServiceDto: CreateServiceDto, @GetUser() user: User) {
    return this.serviceService.create(createServiceDto, user.id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all services with optional filtering' })
  @ApiQuery({ name: 'type', required: false, enum: ['help', 'exchange', 'donation'] })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'itemWanted', required: false })
  @ApiQuery({ name: 'itemOffered', required: false })
  @ApiQuery({ name: 'isCompleted', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all services with pagination' })
  @UsePipes(new ZodValidationPipe(filterServiceSchema))
  findAll(@Query() filters: FilterServiceDto): Promise<{ items: Service[]; total: number; page: number; limit: number }> 
  {
    return this.serviceService.findAll(filters);
  }

  @Get('my-services')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all services created by the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all services created by the user' })
  findMyServices(@GetUser() user: User) {
    return this.serviceService.findByUser(user.id);
  }

  @Get('provided')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all services fulfilled by the authenticated user' })
  @ApiResponse({ status: 200, description: 'Return all services fulfilled by the user' })
  findProvidedServices(@GetUser() user: User) {
    return this.serviceService.findProvidedByUser(user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a service by ID' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({ status: 200, description: 'Return the service' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ status: 200, description: 'Service successfully updated' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  @UsePipes(new ZodValidationPipe(updateServiceSchema))
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(id, updateServiceDto);
  }

  @Patch(':id/assign/:providerId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a provider to a service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiParam({ name: 'providerId', description: 'Provider user ID' })
  @ApiResponse({ status: 200, description: 'Provider successfully assigned' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  assignProvider(@Param('id') id: string, @Param('providerId') providerId: string) {
    return this.serviceService.assignProvider(id, providerId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a service' })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @ApiResponse({ status: 200, description: 'Service successfully deleted' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  remove(@Param('id') id: string) {
    return this.serviceService.remove(id);
  }
}