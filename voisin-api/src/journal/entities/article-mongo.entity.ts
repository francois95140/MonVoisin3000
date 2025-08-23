import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Schéma pour un article individuel
@Schema({ _id: false })
export class ArticleItem {
  @Prop({ required: true })
  titre: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  datePublication: Date;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop()
  sentiment?: number;
}

export const ArticleItemSchema = SchemaFactory.createForClass(ArticleItem);

// Schéma principal pour les nouvelles organisées par ville
@Schema({ collection: 'news' })
export class NewsCollection extends Document {
  @Prop({
    type: Map,
    of: [ArticleItemSchema],
    default: new Map()
  })
  news: Map<string, ArticleItem[]>;
}

export const NewsCollectionSchema = SchemaFactory.createForClass(NewsCollection);

// Type pour la structure complète
export interface NewsStructure {
  news: {
    [ville: string]: ArticleItem[];
  };
}