import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import mongoose from 'mongoose';
import { IUser } from './user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: SoftDeleteModel<UserDocument>,
  ) {}
  getHashPassword(password: string): string {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
  async create(data: CreateUserDto, user: IUser) {
    const { email, name } = data;
    const hashPassword = await this.getHashPassword(data.password);

    const isExist = await this.UserModel.findOne({ email: data.email });

    if (isExist) {
      throw new BadRequestException(`Email ${data.email} already exists`);
    }
    const newUser = await this.UserModel.create({
      email,
      password: hashPassword,
      name,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return newUser;
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const aqp = (await import('api-query-params')).default;
    const { filter, population, sort } = aqp(queryString);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.UserModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.UserModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select('-password')
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
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }

    return await this.UserModel.findById({ _id: id }).select('-password');
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid id');
    }
    return await this.UserModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not found user';
    }

    const foundUser = await this.UserModel.findById(id);

    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('Cannt delete admin account');
    }

    await this.UserModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.UserModel.softDelete({ _id: id });
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.UserModel.findOne({ email: username });
  }

  checkUserPassword(hashPassword: string, password: string): boolean {
    return compareSync(password, hashPassword);
  }
}
