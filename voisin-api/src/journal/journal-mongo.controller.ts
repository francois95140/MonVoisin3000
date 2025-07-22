import {
  Controller,
  Get,
  Param,
  UsePipes,
} from '@nestjs/common';
import { JournalMongoService } from './journal-mongo.service';
import { NewsStructure, ArticleItem } from './entities/article-mongo.entity';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('journal-mongo')
export class JournalMongoController {
  constructor(private readonly journalMongoService: JournalMongoService) {}
  /**
   * Récupérer les articles d'une ville spécifique
   */
  @Get('news')
  async getArticlesByVille(
    @GetUser() user: User
  ): Promise<ArticleItem[]> {
    return await this.journalMongoService.getArticlesByVille(user.ville);
  }
}