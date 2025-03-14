import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../events/user-created.event';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class NotificationsService {
    constructor(
      private emailService: EmailService
    ) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    console.log('Nouvel utilisateur créé:', event);
    await this.emailService.sendWelcomeEmail({
      email: event.email,
      fullName: event.pseudo,
    });
  }
}
