import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from 'src/books/schemas/book.schema';
import { Follow, FollowDocument } from './schemas/follow.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(User.name) private UserModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Book.name) private BookModel: SoftDeleteModel<BookDocument>,
    @InjectModel(Follow.name)
    private FollowModel: SoftDeleteModel<FollowDocument>,
  ) {}
  async create(createFollowDto: CreateFollowDto, user: IUser) {
    const { bookId } = createFollowDto;
    const isFollow = await this.FollowModel.exists({
      bookId,
      userId: user._id,
    });
    if (isFollow) {
      return { message: 'User đã follow sách này rồi' };
    }

    const newFollowBook = await this.FollowModel.create({
      userId: user._id,
      bookId,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: newFollowBook._id,
      createAt: newFollowBook.createdAt,
    };
  }

  async findAll(
    currentPage: number,
    limit: number,
    queryString: string,
    user: IUser,
  ) {
    const aqp = (await import('api-query-params')).default;
    const { filter, population, sort } = aqp(queryString);
    const userId = user._id;
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.FollowModel.find({ userId })).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.FollowModel.find({ userId })
      .skip(offset)
      .limit(limit)
      .populate({ path: 'bookId' }) // Lấy thông tin sách
      .sort('-createAt')
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} follow`;
  }

  update(id: number, updateFollowDto: UpdateFollowDto) {
    return `This action updates a #${id} follow`;
  }

  remove(id: number) {
    return `This action removes a #${id} follow`;
  }

  async toggleFollow(createFollowDto: CreateFollowDto, user: IUser) {
    const { bookId } = createFollowDto;

    // Tìm xem user đã follow book chưa (kể cả soft deleted)
    const isFollow = await this.FollowModel.findOne({
      bookId,
      userId: user._id,
    });

    if (isFollow) {
      if (isFollow.isDeleted) {
        // Nếu từng follow rồi nhưng đã soft delete -> khôi phục
        await this.FollowModel.restore({ _id: isFollow._id });
        return {
          message: 'Followed successfully',
          _id: isFollow._id,
          bookId,
        };
      } else {
        // Nếu đang follow -> soft delete (unfollow)
        await this.FollowModel.softDelete({ _id: isFollow._id });
        return {
          message: 'Unfollowed successfully',
          bookId,
        };
      }
    }

    // Nếu chưa từng follow -> tạo mới
    const newFollowBook = await this.FollowModel.create({
      userId: user._id,
      bookId,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return {
      message: 'Followed successfully',
      followId: newFollowBook._id,
      bookId,
      createAt: newFollowBook.createdAt,
    };
  }

  async checkIsFollowed(bookId: string, user: IUser) {
    const follow = await this.FollowModel.findOne({
      bookId,
      userId: user._id,
      isDeleted: false, // tránh lấy cái soft delete
    });

    return !!follow; // true nếu đã follow
  }
}
