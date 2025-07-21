import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
            port: this.configService.get<number>('POSTGRES_PORT', 5432),
            username: this.configService.get<string>('POSTGRES_USER', 'postgres'),
            password: this.configService.get<string>('POSTGRES_PASSWORD', ''),
            database: this.configService.get<string>('POSTGRES_DB', 'monvoisin3000'),
            autoLoadEntities: true,
            synchronize: true,
            logging: true,
        };
    }
}
