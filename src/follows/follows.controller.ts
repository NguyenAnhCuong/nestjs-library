import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @ResponseMessage('Toggle follow book by user')
  create(@Body() createFollowDto: CreateFollowDto, @User() user: IUser) {
    return this.followsService.toggleFollow(createFollowDto, user);
  }

  @Get()
  @ResponseMessage('Fetch list book with paginate')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.followsService.findAll(+currentPage, +limit, qs, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.followsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFollowDto: UpdateFollowDto) {
    return this.followsService.update(+id, updateFollowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.followsService.remove(+id);
  }

  @Get('/check/:bookId')
  @ResponseMessage('Check Follow book by user')
  async checkFollow(@Param('bookId') bookId: string, @User() user: IUser) {
    return this.followsService.checkIsFollowed(bookId, user);
  }
}
