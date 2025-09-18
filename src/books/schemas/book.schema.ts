// src/schemas/cat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type BookDocument = HydratedDocument<Book>;

@Schema({ timestamps: true })
export class Book {
  @Prop()
  title: string;

  @Prop()
  subtitle: string;

  @Prop()
  authors: string[];

  @Prop()
  published_year: number;

  @Prop()
  categories: string[];

  @Prop()
  thumbnail: string;

  @Prop()
  description: string;

  @Prop()
  average_rating: number;

  @Prop()
  num_pages: number;

  @Prop()
  ratings_count: number;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  createdAt: Date;
}

export const BookSchema = SchemaFactory.createForClass(Book);
