import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        const config = {
            type: 'postgres' as const,
            host: this.configService.get<string>('POSTGRES_HOST', 'localhost'),
            port: parseInt(this.configService.get<string>('POSTGRES_PORT', '5432'), 10),
            username: this.configService.get<string>('POSTGRES_USER', 'postgres'),
            password: this.configService.get<string>('POSTGRES_PASSWORD', ''),
            database: this.configService.get<string>('POSTGRES_DB', 'monvoisin3000'),
            autoLoadEntities: true,
            synchronize: true,
            logging: true,
        };
        
        console.log('PostgreSQL config:', {
            ...config,
            password: '***masked***'
        });
        
        return config;
    }
}
