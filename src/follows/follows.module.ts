import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from 'src/books/schemas/book.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Follow, FollowSchema } from './schemas/follow.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      {
        name: User.name,
        schema: UserSchema,
      },
      { name: Follow.name, schema: FollowSchema },
    ]),
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
})
export class FollowsModule {}
