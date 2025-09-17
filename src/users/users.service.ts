import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: SoftDeleteModel<UserDocument>,
  ) {}
  getHashPassword(password: string): string {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
  async create(createUserDto: CreateUserDto) {
    const createdUser = await this.UserModel.create({
      ...createUserDto,
      password: this.getHashPassword(createUserDto.password),
    });
    return createdUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.UserModel.findOne({ email: username });
  }

  checkUserPassword(hashPassword: string, password: string): boolean {
    return compareSync(password, hashPassword);
  }
}
