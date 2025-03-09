import {
  Body,
  Controller,
  Post, UsePipes,
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
  @Post('reset-password')
  @UsePipes(new ZodValidationPipe(resetPasswordUserSchema))
  @ApiCreatedResponse({
    description: 'Jeton d\'autantification',
    type: AuthResponse
  })
  @ApiOperation({ summary: 'Reset de mot de passe' })
  @ApiResponse({ status: 201, description: 'Utilisateur Reset avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  async resetPassword(
    @Body() resetUserPassword:ResetPasswordDto,
  ): Promise<AuthResponse> {
    const token = await this.authService.resetPassword(resetUserPassword);

    return { token };
  }


  @Public()
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginUserSchema))
  @ApiCreatedResponse({
    description: 'Jeton d\'autantification',
    type: AuthResponse
  })
  @ApiOperation({ summary: 'Connection' })
  @ApiResponse({ status: 201, description: 'Utilisateur conecter avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  async login(
    @Body() loginUser: LoginUserDto,
  ): Promise<AuthResponse> {
    const token = await this.authService.login(loginUser);

    return { token };
  }

  @Public()
  @Post('register')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  @ApiCreatedResponse({
    description: 'Utilisateur créé avec succès.',
    type: User,
  })
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<User | null> {

    return await this.authService.register(createUserDto);;

  }
}
