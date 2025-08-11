import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { createEventSchema, updateEventSchema } from './validations/event-validation';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Public } from '../auth/decorators/public.decorator';
import { Event } from './entities/event.entity';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createEventSchema)) createEventDto: CreateEventDto,
  @GetUser() user: User,): Promise<Event> {
    createEventDto.createdById = user.id;
    return this.eventService.create(createEventDto);
  }

  @Get()
  async findAll(@GetUser() user: User): Promise<Event[]> {
    console.log(user);
    return this.eventService.findAll(user.id);
  }

  @Get('my-events')
  async findMyEvents(@GetUser() user: User): Promise<Event[]> {
    return this.eventService.findByCreator(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateEventSchema))
  async update(
    @Param('id') id: string, 
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: User
  ): Promise<Event> {
    return this.eventService.update(id, updateEventDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: User): Promise<{ message: string }> {
    await this.eventService.remove(id, user.id);
    return { message: 'Événement supprimé avec succès' };
  }

  @Post(':id/register')
  async registerToEvent(
    @Param('id') eventId: string,
    @GetUser() user: User
  ): Promise<{ message: string }> {
    return this.eventService.registerToEvent(eventId, user.id);
  }

  @Delete(':id/unregister')
  async unregisterFromEvent(
    @Param('id') eventId: string,
    @GetUser() user: User
  ): Promise<{ message: string }> {
    return this.eventService.unregisterFromEvent(eventId, user.id);
  }

  @Get('registered/my-registrations')
  async getMyRegisteredEvents(@GetUser() user: User): Promise<Event[]> {
    return this.eventService.getRegisteredEvents(user.id);
  }
}
