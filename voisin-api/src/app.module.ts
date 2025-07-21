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
//import { MessageModule } from './message/message.module';
import { Neo4jModule } from 'nest-neo4j'
import { FriendModule } from './friend/friend.module';
import { ServiceModule } from './service/service.module';
//import { EventModule } from './event/event.module';

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
    Neo4jModule.forRoot({
      scheme: 'neo4j',
      host: 'localhost',
      port: 7687,
      username: 'neo4j',
      password: 'password'
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
    //MessageModule,
    //EventModule
  ],
  controllers: [],
  providers: [AuthService,NotificationsService],
})
export class AppModule {}
