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

  async recommendBooks(
    currentPage: number,
    limit: number,
    queryString: string,
    user: IUser,
  ) {
    const aqp = (await import('api-query-params')).default;
    const { filter, sort } = aqp(queryString);
    const userId = user._id;
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    // 1️⃣ Lấy book đã follow
    const follows = await this.FollowModel.find({
      userId,
      isDeleted: false,
    }).select('bookId');

    const followedBookIds = follows.map((f) => f.bookId);

    let finalFilter: any = {
      isDeleted: false,
      ...filter,
    };

    // 2️⃣ Nếu user đã follow
    if (followedBookIds.length) {
      const followedBooks = await this.BookModel.find({
        _id: { $in: followedBookIds },
        isDeleted: false,
      }).select('categories');

      const categories = [
        ...new Set(followedBooks.flatMap((b) => b.categories || [])),
      ];

      if (categories.length) {
        finalFilter.categories = { $in: categories };
        finalFilter._id = { $nin: followedBookIds };
      }
    } else {
      // 3️⃣ Fallback trending nếu chưa follow gì
      finalFilter._id = { $exists: true };
    }

    // 4️⃣ Đếm tổng
    const totalItems = await this.BookModel.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // 5️⃣ Query data
    const result = await this.BookModel.find(finalFilter)
      .sort({ average_rating: -1, ratings_count: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }
}
