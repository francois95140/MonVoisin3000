import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { ConversationGateway } from './conversation.gateway';
import { MessageController } from './message.controller';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Message, MessageSchema } from './entities/message.entity';
import { Conversation, ConversationSchema } from './entities/conversation.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    UserModule,
  ],
  controllers: [MessageController, ConversationController],
  providers: [MessageGateway, ConversationGateway, MessageService, ConversationService],
  exports: [MessageService, ConversationService],
})
export class MessageModule {}
