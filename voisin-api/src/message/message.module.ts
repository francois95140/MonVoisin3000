import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationGateway } from './conversation.gateway';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation, ConversationSchema } from './entities/conversation.entity';
import { UserModule } from '../user/user.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    UserModule,
    EventModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationGateway, ConversationService],
  exports: [ConversationService],
})
export class MessageModule {}
