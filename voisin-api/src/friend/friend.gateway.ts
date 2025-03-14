import { WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { FriendService } from './friend.service';
import { Friendrequest, ServerToClientEvent } from './type';

@WebSocketGateway({ cors: true })
@Injectable()
export class FriendGateway {
  @WebSocketServer()
  server: Server<any, ServerToClientEvent>;

  constructor(private readonly friendService: FriendService) {}

  @SubscribeMessage('friend')
  handleMessage(client: Friendrequest, payload: Friendrequest): string {
    return 'hello word'
  }
  sendFriendRequest(friendrequest: Friendrequest) {
    this.server.emit('newFriendrequest',friendrequest);
  }
}