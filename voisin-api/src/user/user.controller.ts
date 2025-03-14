import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  updateUserSchema,
  paginationSchema,
  toggleStatusSchema,
  updateRoleSchema,
  updatePreferencesSchema, searchQuerySchema,
} from './validations/user.validation';
import { User, UserRole } from './entities/user.entity';
import { GetUser } from '../auth/decorators/user.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée.' })
  async findAll(
    @Query(new ZodValidationPipe(paginationSchema)) { page, limit }: { page: number; limit: number },
  ) {
    return await this.userService.findAll(page, limit);
  }

  @Get('search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechercher des utilisateurs' })
  @ApiResponse({ status: 200, description: 'Résultats de recherche.' })
  async search(
    @Query(new ZodValidationPipe(searchQuerySchema))
    { query, page, limit }: { query: string; page: number; limit: number },
  ) {
    return await this.userService.searchUsers(query, page, limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.findById(id);
  }

  @Patch()
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  async update(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log("la"+updateUserDto);

    return await this.userService.update(user.id, updateUserDto);
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  async remove(@GetUser() user: User) {
    await this.userService.delete(user.id);

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
    @Body(new ZodValidationPipe(updateRoleSchema)) { role }: { role: UserRole },
  ) {
    return await this.userService.updateRole(id, role);
  }

  @Patch('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour les préférences d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Préférences mises à jour.' })
  async updatePreferences(
    @GetUser() user: User,
    @Body(new ZodValidationPipe(updatePreferencesSchema)) preferences: object,
  ) {
    return await this.userService.updatePreferences(user.id, preferences);
  }
}
