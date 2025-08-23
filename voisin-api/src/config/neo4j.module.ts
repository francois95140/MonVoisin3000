import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import neo4j from 'neo4j-driver';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'NEO4J',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('neo4j');

        return neo4j.driver(
          `${config.scheme}://${config.host}:${config.port}`,
          neo4j.auth.basic(config.username, config.password)
        );
      },
    },
  ],
  exports: ['NEO4J'],
})
export class Neo4jModule {} 