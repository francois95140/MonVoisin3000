import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FriendService } from './friend.service';
import { GetUser } from '../auth/decorators/user.decorator';
import { FriendGateway } from './friend.gateway';

@Controller('friends')
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private friendGateway: FriendGateway
  ) {}

  // ✅ Envoyer une demande d'ami
  @Post('request')
  async sendFriendRequest(@GetUser('id') userId: string, @Body('to') to: string) {
    const friend  = await this.friendService.sendFriendRequest(userId, to);

    return friend;
  }

  // ✅ Accepter une demande d'ami
  @Post('accept')
  async acceptFriendRequest(@GetUser('id') userId: string, @Body('from') from: string) {
    return this.friendService.acceptFriendRequest(from, userId);
  }

  // ✅ Rejeter une demande d'ami
  @Post('reject')
  async rejectFriendRequest(@GetUser('id') userId: string, @Body('from') from: string) {
    return this.friendService.rejectFriendRequest(from, userId);
  }

  // ✅ Récupérer la liste des amis de l'utilisateur connecté
  @Get()
  async getFriends(@GetUser('id') userId: string) {
    return this.friendService.getFriends(userId);
  }

  // ✅ Récupérer la liste de demande d'amis de l'utilisateur connecté
  @Get('requests/incoming')
  async getIncomingFriendRequests(@GetUser('id') userId: string) {
    return this.friendService.getIncomingFriendRequests(userId);
  }

  // ✅ Récupérer la liste de demande d'amis de l'utilisateur connecté
  @Get('requests/outgoing')
  async getOutgoingFriendRequests(@GetUser('id') userId: string) {
    return this.friendService.getOutgoingFriendRequests(userId);
  }
}
