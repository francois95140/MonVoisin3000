import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from './config/mongo.config';
import neo4jConfig from './config/neo4j.config';
import { TypeOrmConfigService } from './config/posgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Neo4jModule } from './config/neo4j.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [neo4jConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongoConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    Neo4jModule,
    UserModule,
    AuthModule
  ],
  controllers: [],
  providers: [AuthService],
})
export class AppModule {}
