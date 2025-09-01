import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { EmailModule } from '../email/email.module';
import { Event } from 'src/event/entities/event.entity';
import { GeolocationService } from '../common/services/geolocation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User,Event]),
    EmailModule,
  ],
  controllers: [UserController],
  providers: [UserService, GeolocationService],
  exports: [UserService], // Export UserService pour l'utiliser dans d'autres modules (ex: AuthModule)
})
export class UserModule {}