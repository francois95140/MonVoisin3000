import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NewsCollection, ArticleItem, NewsStructure } from './entities/article-mongo.entity';

@Injectable()
export class JournalMongoService {
  constructor(
    @InjectModel(NewsCollection.name)
    private newsModel: Model<NewsCollection>,
  ) {}

  /**
   * Récupérer les articles d'une ville spécifique
   */
  async getArticlesByVille(ville: string): Promise<ArticleItem[]> {
    const newsDoc = await this.newsModel.findOne();
    
    if (!newsDoc) {
      return [];
    }

    return newsDoc.news.get(ville) || [];
  }
}