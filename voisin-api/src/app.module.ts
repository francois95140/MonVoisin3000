import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from './config/mongo.config';
import { TypeOrmConfigService } from './config/posgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { EmailModule } from './email/email.module';
import { NotificationsService } from './user/notifications/notifications.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MessageModule } from './message/message.module';
import { Neo4jModule } from 'nest-neo4j'
import { FriendModule } from './friend/friend.module';
import { ServiceModule } from './service/service.module';
import { JournalMongoModule } from './journal/journal-mongo.module';
import { EventModule } from './event/event.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongoConfig,
      inject: [ConfigService],
    }),
    Neo4jModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        scheme: 'neo4j',
        host: configService.get<string>('NEO4J_HOST', 'localhost'),
        port: configService.get<number>('NEO4J_BOLT_PORT', 7687),
        username: configService.get<string>('NEO4J_USER', 'neo4j'),
        password: configService.get<string>('NEO4J_PASSWORD', 'password123')
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    EventEmitterModule.forRoot(),
    Neo4jModule,
    AuthModule,
    UserModule,
    FriendModule,
    ServiceModule,
    EmailModule,
    MessageModule,
    EventModule
  ],
  controllers: [],
  providers: [AuthService,NotificationsService],
})
export class AppModule {}
