import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { WelcomeEmailDto } from './dto/welcom-user';

/* interface PasswordResetEmailDto {
  email: string;
  fullName: string;
  passwordResetCode: string;
}*/

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendWelcomeEmail(dto: WelcomeEmailDto) {
    await this.mailerService.sendMail({
      to: dto.email,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome',
      template: './welcome', // `.hbs` extension is appended automatically
      context: {
        name: dto.fullName,
        logoUrl: 'https://votreapp.com/logo.png',
        dashboardUrl: 'https://votreapp.com/dashboard',
        appName: 'Votre Application',
        currentYear: 2025,
        unsubscribeUrl: 'https://votreapp.com/unsubscribe',
        privacyUrl: 'https://votreapp.com/privacy',
      },
    });
  }

  async sendMail(options: any) {
    return await this.mailerService.sendMail(options);
  }

}
