import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createUserSchema,
  updateUserSchema,
  loginUserSchema,
  paginationSchema,
  toggleStatusSchema,
  updateRoleSchema,
  updatePreferencesSchema,
} from './validations/user.validation';
import { User } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: User,
  })
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  async create(@Body() createUserDto: CreateUserDto):Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginUserSchema))
  @ApiOperation({ summary: 'Connecter un utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie.' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides.' })
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.userService.validateCredentials(loginUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée.' })
  async findAll(
    @Query(new ZodValidationPipe(paginationSchema)) { page, limit }: { page: number; limit: number },
  ) {
    return await this.userService.findAll(page, limit);
  }

  /* @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechercher des utilisateurs' })
  @ApiResponse({ status: 200, description: 'Résultats de recherche.' })
  async search(
    @Query(new ZodValidationPipe(searchQuerySchema))
    { query, page, limit }: { query: string; page: number; limit: number },
  ) {
    return await this.userService.searchUsers(query, page, limit);
  }*/

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.findById(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.delete(id);

    return { message: 'Utilisateur supprimé avec succès' };
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activer/désactiver un utilisateur' })
  @ApiResponse({ status: 200, description: 'Statut utilisateur mis à jour.' })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(toggleStatusSchema)) { isActive }: { isActive: boolean },
  ) {
    return await this.userService.toggleUserStatus(id, isActive);
  }

  @Patch(':id/role')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier le rôle d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Rôle utilisateur mis à jour.' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateRoleSchema)) { role }: { role: string },
  ) {
    return await this.userService.updateRole(id, role);
  }

  @Patch(':id/preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour les préférences d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Préférences mises à jour.' })
  async updatePreferences(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updatePreferencesSchema)) preferences: object,
  ) {
    return await this.userService.updatePreferences(id, preferences);
  }
}
