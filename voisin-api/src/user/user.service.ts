import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserInput, UpdateUserInput, LoginUserInput } from './validations/user.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      role: 'user',
    });

    return await this.userRepository.save(user);
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

    await this.userRepository.softDelete(user);
  }

  async validateCredentials(input: LoginUserInput): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
      select: ['id', 'email', 'password', 'isActive', 'isVerified'],
    });

    if (!user) {
      throw new BadRequestException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('Identifiants invalides');
    }

    if (!user.isActive) {
      throw new BadRequestException('Compte désactivé');
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    return user;
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

  async updateRole(id: string, role: string): Promise<User> {
    const user = await this.findById(id);

    user.role = role;

    return await this.userRepository.save(user);
  }

  async updatePreferences(id: string, preferences: object): Promise<User> {
    const user = await this.findById(id);

    user.preferences = { ...user.preferences, ...preferences };

    return await this.userRepository.save(user);
  }

  /* async searchUsers(query: string, page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      where: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
      ],
      select: ['id', 'username', 'email', 'fullName', 'avatar', 'bio', 'isVerified', 'isActive', 'role'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { users, total };
  }*/
}
