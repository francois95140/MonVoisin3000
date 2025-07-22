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
import { EmailService } from '../email/email.service';

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
    private readonly emailService: EmailService,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: input.email },
        { pseudo: input.pseudo },
      ],
    });

    if (existingUser) {
      if (existingUser.email === input.email) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
      if (existingUser.pseudo === input.pseudo) {
        throw new ConflictException('Un utilisateur avec ce nom d\'utilisateur existe déjà');
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Créer le nouvel utilisateur
    const creatingUser = this.userRepository.create({
      ...input,
      password: hashedPassword,
      isActive: true,
      isVerified: false,
    });

    const user = await this.userRepository.save(creatingUser);

    const query = `
      CREATE (u:User {pseudo: $pseudo, tag: $tag, userPgId: $userId})
      RETURN u
    `;

    const params = {pseudo : user.pseudo, tag : user.tag, userId : user.id};

    await this.neo4jService.write(query, params);

    /* this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(user.id, user.email, user.createdAt, user.username)
    );*/

    return user;
  }

  async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async removeRefreshToken(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: undefined });
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
      select: ['id', 'pseudo', 'email', 'tag', 'avatar', 'bio', 'isVerified', 'isActive', 'role', 'lastLogin', 'createdAt'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'pseudo', 'phoneNumber','email', 'tag', 'avatar', 'bio', 'isVerified', 'rue', 'cp', 'ville', 'address', 'isActive', 'role', 'lastLogin', 'createdAt'],
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
    /* if (input.password) {
      input.password = await bcrypt.hash(input.password, 10);
    }*/

    // Vérifier si le nouvel email/username n'est pas déjà utilisé
    if (input.email || input.pseudo) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: input.email, id:  id  },
          { pseudo: input.pseudo, id:  id  },
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
        { pseudo: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
        { tag: ILike(`%${query}%`) },
      ],
      select: ['id', 'pseudo', 'email', 'tag', 'avatar', 'bio', 'isVerified', 'isActive', 'role'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { users, total };
  }

  /**
   * Génère et envoie un code de réinitialisation de mot de passe par email
   * @param email - L'email de l'utilisateur
   * @returns Promise<void>
   */
  async sendResetPasswordCode(email: string): Promise<void> {
    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`Aucun utilisateur trouvé avec l'email ${email}`);
    }

    // Générer un code aléatoire de 5 caractères alphanumériques
    const resetCode = this.generateRandomCode(5);

    // Sauvegarder le code dans la base de données
    user.resetPasswordCode = resetCode;
    await this.userRepository.save(user);

    // Envoyer l'email avec le code
    await this.sendResetPasswordEmail(email, user.pseudo || 'Utilisateur', resetCode);
  }

  /**
   * Génère un code aléatoire alphanumériques
   * @param length - Longueur du code
   * @returns string
   */
  private generateRandomCode(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  }

  /**
   * Envoie l'email de réinitialisation de mot de passe
   * @param email - Email du destinataire
   * @param fullName - Nom complet de l'utilisateur
   * @param resetCode - Code de réinitialisation
   */
  private async sendResetPasswordEmail(email: string, fullName: string, resetCode: string): Promise<void> {
    await this.emailService.sendMail({
      to: email,
      from: '"Support Team" <support@monvoisin3000.com>',
      subject: 'Code de réinitialisation de mot de passe - MonVoisin3000',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour ${fullName},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte MonVoisin3000.</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="color: #007bff; font-size: 24px; letter-spacing: 3px; margin: 0;">${resetCode}</h3>
            <p style="margin: 10px 0 0 0; color: #666;">Code de réinitialisation</p>
          </div>
          <p>Utilisez ce code pour réinitialiser votre mot de passe. Ce code est valide pendant 15 minutes.</p>
          <p style="color: #666; font-size: 12px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">MonVoisin3000 - Votre plateforme de voisinage</p>
        </div>
      `,
    });
  }

}
