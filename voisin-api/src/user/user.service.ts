import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Neo4jService } from 'nest-neo4j';

import {
  CreateUserInput,
  UpdateUserInput,
  ResetPasswordUserInput,
} from './validations/user.validation';
import * as bcrypt from 'bcrypt';
import { UserCreatedEvent } from './events/user-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
    private readonly neo4jService: Neo4jService,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: input.email },
        { username: input.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Créer le nouvel utilisateur
    const user = this.userRepository.create({
      ...input,
      password: hashedPassword,
      isActive: true,
      isVerified: false,
    });

    const query = `
      CREATE (u:User { username: $username, email: $email})
      RETURN u
    `;

    const params = { username : user.username, email : user.email };

    await this.neo4jService.write(query, params);

    /* this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(user.id, user.email, user.createdAt, user.username)
    );*/

    return await this.userRepository.save(user);
  }

  async resetPassword(input: ResetPasswordUserInput): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { passwordResetCode: input.passwordResetCode },
    });

    if (!user || !user.passwordResetCode || user.passwordResetCode === '') {
      throw new UnauthorizedException('Wrong reset password code');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(input.newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetCode = '';

    await this.userRepository.save(user);

    return user;
  }

  async findAll(page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      select: ['id', 'username', 'email', 'fullName', 'avatar', 'bio', 'isVerified', 'isActive', 'role', 'lastLogin', 'createdAt'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'fullName', 'avatar', 'bio', 'isVerified', 'isActive', 'role', 'lastLogin', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'email ${email} non trouvé`);
    }

    return user;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const user = await this.findById(id);

    // Si le mot de passe est mis à jour, le hasher
    if (input.password) {
      input.password = await bcrypt.hash(input.password, 10);
    }

    // Vérifier si le nouvel email/username n'est pas déjà utilisé
    if (input.email || input.username) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: input.email, id:  id  },
          { username: input.username, id:  id  },
        ],
      });

      if (existingUser) {
        throw new ConflictException('Email ou nom d\'utilisateur déjà utilisé');
      }
    }

    // Mettre à jour l'utilisateur
    Object.assign(user, input);

    return await this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);

    await this.userRepository.softRemove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLogin: new Date(),
    });
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.findById(id);

    user.isActive = isActive;

    return await this.userRepository.save(user);
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    const user = await this.findById(id);

    user.role = role;

    return await this.userRepository.save(user);
  }

  async updatePreferences(id: string, preferences: object): Promise<User> {
    const user = await this.findById(id);

    user.preferences = { ...user.preferences, ...preferences };

    return await this.userRepository.save(user);
  }

  async searchUsers(query: string, page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
        { fullName: ILike(`%${query}%`) },
      ],
      select: ['id', 'username', 'email', 'fullName', 'avatar', 'bio', 'isVerified', 'isActive', 'role'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { users, total };
  }
}
