import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Vérifier que l'utilisateur créateur existe
    const creator = await this.userRepository.findOne({
      where: { id: createEventDto.createdById }
    });
    
    if (!creator) {
      throw new NotFoundException('Utilisateur créateur introuvable');
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      createdBy: creator.id,
      quartier: creator.quartier,
    });

    return await this.eventRepository.save(event);
  }

  async findAll(id : string): Promise<Event[]> {
    const user = await this.userRepository.findOne({ where: { id } });
    console.log(user?.quartier);
    return await this.eventRepository.find({
      relations: ['creator'],
      where: {
        quartier: user?.quartier,
      },
      order: { startDate: 'ASC', startTime: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator', 'participants']
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string): Promise<Event> {
    const event = await this.findOne(id);

    // Vérifier que l'utilisateur est le créateur de l'événement
    if (event.createdBy !== userId) {
      throw new ForbiddenException('Vous ne pouvez modifier que vos propres événements');
    }

    // Vérifier s'il y a des inscrits
    if (event.participants && event.participants.length > 0) {
      throw new ForbiddenException('Impossible de modifier un événement ayant des participants inscrits');
    }

    return await this.eventRepository.save(updateEventDto);
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.findOne(id);

    // Vérifier que l'utilisateur est le créateur de l'événement
    if (event.createdBy !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres événements');
    }

    // Vérifier s'il y a des inscrits
    if (event.participants && event.participants.length > 0) {
      throw new ForbiddenException('Impossible de supprimer un événement ayant des participants inscrits');
    }

    await this.eventRepository.softDelete(id);
  }

  async findByCreator(creatorId: string): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { createdBy: creatorId },
      order: { startDate: 'ASC', startTime: 'ASC' }
    });
  }

  // Méthode pour incrémenter le nombre d'inscrits (à utiliser lors de l'inscription)
  async incrementInscrits(eventId: string): Promise<void> {
    await this.eventRepository.increment({ id: eventId }, 'nombreInscrits', 1);
  }

  // Méthode pour décrémenter le nombre d'inscrits (à utiliser lors de la désinscription)
  async decrementInscrits(eventId: string): Promise<void> {
    await this.eventRepository.decrement({ id: eventId }, 'nombreInscrits', 1);
  }

  // Inscription à un événement
  async registerToEvent(eventId: string, userId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['participants']
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    // Vérifier que l'utilisateur n'est pas déjà inscrit
    const isAlreadyRegistered = event.participants.some(participant => participant.id === userId);
    if (isAlreadyRegistered) {
      throw new BadRequestException('Vous êtes déjà inscrit à cet événement');
    }

    // Vérifier que l'utilisateur n'est pas le créateur
    if (event.createdBy === userId) {
      throw new BadRequestException('Vous ne pouvez pas vous inscrire à votre propre événement');
    }

    // Récupérer l'utilisateur
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Ajouter l'utilisateur aux participants
    event.participants.push(user);
    const res = await this.eventRepository.save(event);

    return {status: 200, message: 'Inscription réussie à l\'événement'} ;
  }

  // Désinscription d'un événement
  async unregisterFromEvent(eventId: string, userId: string): Promise<{ message: string }> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['participants']
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    // Vérifier que l'utilisateur est inscrit
    const participantIndex = event.participants.findIndex(participant => participant.id === userId);
    if (participantIndex === -1) {
      throw new BadRequestException('Vous n\'êtes pas inscrit à cet événement');
    }

    // Retirer l'utilisateur des participants
    event.participants.splice(participantIndex, 1);
    await this.eventRepository.save(event);

    return { message: 'Désinscription réussie de l\'événement' };
  }

  // Obtenir les événements auxquels un utilisateur est inscrit
  async getRegisteredEvents(userId: string): Promise<Event[]> {
    return await this.eventRepository
      .createQueryBuilder('event')
      .innerJoin('event.participants', 'participant')
      .where('participant.id = :userId', { userId })
      .orderBy('event.startDate', 'ASC')
      .addOrderBy('event.startTime', 'ASC')
      .getMany();
  }

  // Obtenir tous les participants d'un événement (créateur + participants) avec l'icône
  async getEventParticipantIds(eventId: string): Promise<string[]> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['creator', 'participants']
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    const participantIds: string[] = [];
    
    // Ajouter le créateur
    if (event.creator && event.creator.id) {
      participantIds.push(event.creator.id);
    } else if (event.createdBy) {
      participantIds.push(event.createdBy);
    }
    
    // Ajouter les participants
    if (event.participants) {
      event.participants.forEach(participant => {
        if (!participantIds.includes(participant.id)) {
          participantIds.push(participant.id);
        }
      });
    }

    return participantIds;
  }

  // Obtenir les détails d'un événement pour la conversation (participants + icône)
  async getEventForConversation(eventId: string): Promise<{ participantIds: string[], eventIcon: string }> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['creator', 'participants']
    });

    if (!event) {
      throw new NotFoundException('Événement introuvable');
    }

    const participantIds: string[] = [];
    
    // Ajouter le créateur
    if (event.creator && event.creator.id) {
      participantIds.push(event.creator.id);
    } else if (event.createdBy) {
      participantIds.push(event.createdBy);
    }
    
    // Ajouter les participants
    if (event.participants) {
      event.participants.forEach(participant => {
        if (!participantIds.includes(participant.id)) {
          participantIds.push(participant.id);
        }
      });
    }

    return {
      participantIds,
      eventIcon: event.imageUrl || 'calendar'
    };
  }
}
