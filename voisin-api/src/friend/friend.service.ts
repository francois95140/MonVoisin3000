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

  // 📌 Vérifier le statut d'amitié entre deux utilisateurs
  async getFriendshipStatus(userId1: string, userId2: string): Promise<'none' | 'friends' | 'pending' | 'sent'> {
    const query = `
      MATCH (a:User {userPgId: $userId1}), (b:User {userPgId: $userId2})
      OPTIONAL MATCH (a)-[r1:FRIEND]-(b)
      OPTIONAL MATCH (a)-[r2:FRIEND_REQUEST]->(b)
      OPTIONAL MATCH (b)-[r3:FRIEND_REQUEST]->(a)
      RETURN r1, r2, r3
    `;

    const result = await this.neo4jService.read(query, { userId1, userId2 });
    
    if (result.records.length === 0) {
      return 'none';
    }

    const record = result.records[0];
    const friendRelation = record.get('r1');
    const sentRequest = record.get('r2');
    const receivedRequest = record.get('r3');

    if (friendRelation) {
      return 'friends';
    } else if (sentRequest) {
      return 'sent';
    } else if (receivedRequest) {
      return 'pending';
    } else {
      return 'none';
    }
  }

  // 📌 Suggestions d'amis basées sur un algorithme
  async getFriendSuggestions(userId: string, limit: number = 10) {
    const query = `
      MATCH (user:User {userPgId: $userId})
      
      // Trouver les amis d'amis (niveau 2)
      OPTIONAL MATCH (user)-[:FRIEND]->(friend)-[:FRIEND]->(suggestion)
      WHERE suggestion <> user
        AND NOT (user)-[:FRIEND]-(suggestion)
        AND NOT (user)-[:FRIEND_REQUEST]-(suggestion)
        AND NOT (suggestion)-[:FRIEND_REQUEST]-(user)
      
      WITH user, suggestion, COUNT(friend) as mutualFriends
      WHERE suggestion IS NOT NULL
      
      // Calculer le score de suggestion
      WITH suggestion, mutualFriends,
           mutualFriends * 2 as friendScore
      
      // Ajouter des utilisateurs aléatoires si pas assez de suggestions
      UNION
      
      MATCH (user:User {userPgId: $userId})
      MATCH (randomUser:User)
      WHERE randomUser <> user
        AND NOT (user)-[:FRIEND]-(randomUser)
        AND NOT (user)-[:FRIEND_REQUEST]-(randomUser)
        AND NOT (randomUser)-[:FRIEND_REQUEST]-(user)
      
      WITH randomUser as suggestion, 0 as mutualFriends, 1 as friendScore
      
      // Retourner les suggestions triées par score
      RETURN DISTINCT suggestion, mutualFriends, friendScore
      ORDER BY friendScore DESC, mutualFriends DESC, rand()
      LIMIT $limit
    `;

    const result = await this.neo4jService.read(query, { userId, limit });

    return result.records.map((record) => ({
      user: record.get('suggestion').properties,
      mutualFriends: record.get('mutualFriends').toNumber(),
      score: record.get('friendScore').toNumber()
    }));
  }
}
