import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { FriendService } from './friend.service';
import { GetUser } from '../auth/decorators/user.decorator';
import { FriendGateway } from './friend.gateway';
import { User } from 'src/user/entities/user.entity';

@Controller('friends')
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private friendGateway: FriendGateway
  ) {}

  // ✅ Envoyer une demande d'ami
  @Post('request')
  async sendFriendRequest(
    @GetUser() user:User ,
    @Body('to') to: string) {
    const friend  = await this.friendService.sendFriendRequest(user.id, to);

    return friend;
  }

  // ✅ Accepter une demande d'ami
  @Post('accept')
  async acceptFriendRequest(
    @GetUser() user:User ,
    @Body('from') from: string
  ) {
    return this.friendService.acceptFriendRequest(from, user.id);
  }

  // ✅ Rejeter une demande d'ami
  @Post('reject')
  async rejectFriendRequest(
    @GetUser() user:User ,
    @Body('from') from: string
  ) {
    return this.friendService.rejectFriendRequest(from, user.id);
  }

  // ✅ Récupérer la liste des amis de l'utilisateur connecté
  @Get()
  async getFriends(
    @GetUser() user:User ,
  ) {
    return this.friendService.getFriends(user.id);
  }

  // ✅ Récupérer la liste de demande d'amis de l'utilisateur connecté
  @Get('requests/incoming')
  async getIncomingFriendRequests(@GetUser('id') userId: string) {
    return this.friendService.getIncomingFriendRequests(userId);
  }

  // ✅ Récupérer la liste de demande d'amis de l'utilisateur connecté
  @Get('requests/outgoing')
  async getOutgoingFriendRequests(
    @GetUser() user:User ,
  ) {
    return this.friendService.getOutgoingFriendRequests(user.id);
  }

  // ✅ Obtenir des suggestions d'amis
  @Get('suggestions')
  async getFriendSuggestions(
    @GetUser() user:User ,
    @Query('limit') limit?: string
  ) {
    const suggestionLimit = limit ? parseInt(limit, 10) : 10;
    return this.friendService.getFriendSuggestions(user.id, suggestionLimit);
  }

  // ✅ Vérifier le statut d'amitié avec un utilisateur
  @Get('status/:userId')
  async getFriendshipStatus(
    @GetUser() user: User,
    @Param('userId') userId: string
  ) {
    const status = await this.friendService.getFriendshipStatus(user.id, userId);
    return {
      success: true,
      status: status
    };
  }
}
