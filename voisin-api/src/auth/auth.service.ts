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
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

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
      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '24h',
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (token) {
        await this.userService.updateLastLogin(user.id);
      }

      return token;
    }

    if (!user.password) {
      throw new UnauthorizedException("User doesn't have a password set");
    }

    if (!(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Password doesn't match");
    }
    const payload = this.userToPayload(user);
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    return token;
  }

  async register(dto: CreateUserDto): Promise<User | null> {
    return this.userService.create(dto);
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
