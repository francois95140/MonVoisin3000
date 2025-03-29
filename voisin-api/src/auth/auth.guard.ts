import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private usersService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.id);

      if (!user) {
        throw new UnauthorizedException();
      }

      request['user'] = user;
    } catch (error) {

      if (error.name === 'TokenExpiredError') {
        return this.handleRefreshToken(request, context);
      }
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }

  private async handleRefreshToken(request: Request, context: ExecutionContext): Promise<boolean> {
  
    const refreshToken = this.extractRefreshTokenFromCookie(request);
    
    if (!refreshToken) {
      throw new UnauthorizedException('Session expired');
    }
    
    try {
      // Vérifier le refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      
      const user = await this.usersService.findById(payload.id);
      
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
      
      // Attacher le nouveau token à la réponse
      const response = context.switchToHttp().getResponse();

      response.setHeader('Authorization', `Bearer ${newAccessToken}`);
      
      // Attacher l'utilisateur à la requête
      request['user'] = user;
      
      return true;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private extractRefreshTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.refresh_token;
  }
}
