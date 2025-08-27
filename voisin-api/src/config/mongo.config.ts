import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = async (
  configService: ConfigService,
): Promise<MongooseModuleOptions> => {
  const username = configService.get<string>('MONGODB_USERNAME');
  const password = configService.get<string>('MONGODB_PASSWORD');
  const host = configService.get<string>('MONGODB_HOST', 'localhost');
  const port = configService.get<number>('MONGODB_PORT', 27017);
  const database = configService.get<string>('MONGODB_DATABASE', 'monvoisin3000');

  const uri = username && password
    ? `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`
    : `mongodb://${host}:${port}/${database}`;

  console.log('MongoDB URI:', uri);
  return { uri };
}; 