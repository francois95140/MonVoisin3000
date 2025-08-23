import { registerAs } from '@nestjs/config';

export default registerAs('neo4j', () => ({
  host: process.env.NEO4J_HOST as string || 'localhost',
  port: parseInt(process.env.NEO4J_PORT || '7687', 10),
  username: process.env.NEO4J_USERNAME as string || 'neo4j',
  password: process.env.NEO4J_PASSWORD as string || '',
  database: process.env.NEO4J_DATABASE as string || 'neo4j',
  scheme: 'neo4j' as const,
})); 