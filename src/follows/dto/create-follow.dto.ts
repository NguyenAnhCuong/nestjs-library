import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateFollowDto {
  @IsNotEmpty({ message: 'bookId is Required' })
  @IsMongoId({ message: 'bookId must is mongo id' })
  bookId: mongoose.Schema.Types.ObjectId;
}
