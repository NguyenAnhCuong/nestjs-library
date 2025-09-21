// src/schemas/cat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Book } from 'src/books/schemas/book.schema';
import { User } from 'src/users/schemas/user.schema';

export type FollowDocument = HydratedDocument<Follow>;

@Schema({ timestamps: true })
export class Follow {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Book.name })
  bookId: mongoose.Schema.Types.ObjectId;

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

export const FollowSchema = SchemaFactory.createForClass(Follow);
