import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';

@Injectable()
export class FriendService {
  constructor(private readonly neo4jService: Neo4jService) {}

  // 📌 Envoyer une demande d'ami
  async sendFriendRequest(from: string, to: string) {
    const query = `
      MATCH (a:User {userPgId: $from}), (b:User {userPgId: $to})
      OPTIONAL MATCH (a)-[r:FRIEND_REQUEST|FRIENDS]->(b)
      WITH a, b, r
      WHERE r IS NULL
      CREATE (a)-[:FRIEND_REQUEST]->(b)
      RETURN a, b
    `;

    const result = await this.neo4jService.write(query, { from, to });

    if (result.records.length === 0) {
      return { message: "Friend request already exists or users are already friends!" };
    }

    return { message: "Friend request sent!" };
  }

  // 📌 Liste des demandes d'amis reçues par un utilisateur
  async getIncomingFriendRequests(userId: string) {
    const query = `
    MATCH (sender:User)-[:FRIEND_REQUEST]->(u:User {userPgId: $userId})
    RETURN sender
  `;
    const result = await this.neo4jService.read(query, { userId });

    return result.records.map((record) => record.get('sender').properties);
  }

  // 📌 Liste des demandes d'amis envoyées par un utilisateur
  async getOutgoingFriendRequests(userId: string) {
    const query = `
    MATCH (u:User {userPgId: $userId})-[:FRIEND_REQUEST]->(receiver:User)
    RETURN receiver
  `;
    const result = await this.neo4jService.read(query, { userId });

    return result.records.map((record) => record.get('receiver').properties);
  }

  // 📌 Accepter une demande d’ami
  async acceptFriendRequest(from: string, to: string) {
    const query = `
      MATCH (a:User {userPgId: $from})-[r:FRIEND_REQUEST]->(b:User {userPgId: $to})
      DELETE r
      CREATE (a)-[:FRIEND]->(b), (b)-[:FRIEND]->(a)
      RETURN a, b
    `;

    await this.neo4jService.write(query, { from, to });

    return { message: 'Friend request accepted!' };
  }

  // 📌 Rejeter une demande d’ami
  async rejectFriendRequest(from: string, to: string) {
    const query = `
      MATCH (:User {userPgId: $from})-[r:FRIEND_REQUEST]->(:User {userPgId: $to})
      DELETE r
    `;

    await this.neo4jService.write(query, { from, to });

    return { message: 'Friend request rejected!' };
  }

  // 📌 Liste des amis d’un utilisateur
  async getFriends(userId: string) {
    const query = `
      MATCH (u:User {id: $userId})-[:FRIEND]-(friend)
      RETURN friend
    `;
    const result = await this.neo4jService.read(query, { userId });

    return result.records.map((record) => record.get('friend').properties);
  }
}
