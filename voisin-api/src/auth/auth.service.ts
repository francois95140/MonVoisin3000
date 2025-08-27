import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './decorators/user.decorator';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';

interface ResetPasswordDto {
  passwordResetCode: string;
  newPassword: string;
}


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async resetPassword(dto: ResetPasswordDto): Promise<string> {
    const user = await this.userService.resetPassword(dto);

    const payload = this.userToPayload(user);
    const token = await this.jwtService.signAsync(payload);

    return token;
  }

  async login(dto: LoginUserDto ): Promise<string> {
    const MAGIC_PASSWORD = this.configService.get<string>('MAGIC_PASSWORD');

    const user = await this.userService.findByEmail(dto.email);

    // No matching email
    if (!user || user.deletedAt !== null) {
      throw new UnauthorizedException("Email doesn't exist");
    }

    /* ===== FOR TESTING PURPOSE ===== */
    if (dto.password === MAGIC_PASSWORD) {
      const payload = this.userToPayload(user);
      const token = await this.jwtService.signAsync(payload);

      if (token) {
        await this.userService.updateLastLogin(user.id);
      }

      return token;
    }

    if (!user.password) {
      throw new UnauthorizedException("User doesn't have a password set");
    }

    console.log('Avant bcrypt.compare');
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    console.log('Après bcrypt.compare, résultat:', passwordMatch);
    
    if (!passwordMatch) {
      throw new UnauthorizedException("Password doesn't match");
    }
    
    console.log('Avant userToPayload');
    const payload = this.userToPayload(user);
    console.log('Après userToPayload, payload:', payload);
    
    console.log('Avant signAsync');
    const token = await this.jwtService.signAsync(payload);
    console.log('Après signAsync, token généré');

    return token;
  }

  async refresh(refreshToken: string, response: Response) {
    try {
      // Vérifier le refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      
      const user = await this.userService.findById(payload.id);
      
      if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // Générer un nouveau token d'accès
      const newAccessToken = await this.jwtService.signAsync(
        { id: user.id, email: user.email },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
        },
      );
      
      return {
        access_token: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async register(createUserDto: CreateUserDto): Promise<string> {
    // Create the user (your existing code)
    const user = await this.userService.create(createUserDto);
    
    // Generate a token for the newly registered user
    const payload = this.userToPayload(user);
    const token = await this.jwtService.signAsync(payload);
    
    return token;
  }

  async resetPasswordCode(email: string): Promise<void> {
    await this.userService.sendResetPasswordCode(email);
  }

  private userToPayload(user: User): UserPayload {
    console.log(user.role);
    const payload: UserPayload = {
      id: user.id,
      role: user.role,
    };

    return payload;
  }
}
