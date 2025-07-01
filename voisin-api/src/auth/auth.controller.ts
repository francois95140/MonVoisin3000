import {
  Body,
  Controller,
  Post, Req, Res, UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { User } from '../user/entities/user.entity';
import { ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { createUserSchema, loginUserSchema, resetPasswordUserSchema } from '../user/validations/user.validation';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ResetPasswordDto } from '../user/dto/reset-Pessword.dto';
import { AuthResponse } from './dto/auth-response';



@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiCreatedResponse({
    description: 'Utilisateur créé avec succès et authentifié.',
    type: AuthResponse,
  })
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès et authentifié.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  async register(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ): Promise<AuthResponse> {
    const token = await this.authService.register(createUserDto);
    
    return { token };
  }


  @Public()
  @Post('login')
  @ApiCreatedResponse({
    description: 'Jeton d\'autantification',
    type: AuthResponse
  })
  @ApiOperation({ summary: 'Connection' })
  @ApiResponse({ status: 201, description: 'Utilisateur conecter avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  async login(
    @Body(new ZodValidationPipe(loginUserSchema)) loginUser: LoginUserDto,
  ): Promise<AuthResponse> {
    const token = await this.authService.login(loginUser);

    return { token };
  }


  @Public()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = (req as any).cookies?.refresh_token;
    if (!refreshToken) {
      return { statusCode: 401, message: 'Refresh token not found' };
    }
    return this.authService.refresh(refreshToken, response);
  }

  @Public()
  @Post('reset-password')
  @ApiCreatedResponse({
    description: 'Jeton d\'autantification',
    type: AuthResponse
  })
  @ApiOperation({ summary: 'Reset de mot de passe' })
  @ApiResponse({ status: 201, description: 'Utilisateur Reset avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordUserSchema)) resetUserPassword:ResetPasswordDto,
  ): Promise<AuthResponse> {
    const token = await this.authService.resetPassword(resetUserPassword);

    return { token };
  }
}
