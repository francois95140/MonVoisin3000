import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JournalMongoController } from './journal-mongo.controller';
import { JournalMongoService } from './journal-mongo.service';
import { NewsCollection, NewsCollectionSchema } from './entities/article-mongo.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NewsCollection.name, schema: NewsCollectionSchema },
    ]),
  ],
  controllers: [JournalMongoController],
  providers: [JournalMongoService],
  exports: [JournalMongoService],
})
export class JournalMongoModule {}