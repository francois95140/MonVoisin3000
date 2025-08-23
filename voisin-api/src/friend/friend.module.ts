import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendGateway } from './friend.gateway';
import { FriendController } from './friend.controller';
import { Neo4jModule } from 'nest-neo4j';

@Module({
  imports: [Neo4jModule],
  providers: [FriendService, FriendGateway],
  controllers: [FriendController],
})
export class FriendModule {}