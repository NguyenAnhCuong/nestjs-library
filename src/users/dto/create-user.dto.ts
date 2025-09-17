import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  // @IsNotEmpty({ message: 'Age is required' })
  // age: number;

  // @IsNotEmpty({ message: 'Address is required' })
  // address: string;

  // @IsNotEmpty({ message: 'Gender is required' })
  // gender: string;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsNotEmpty({ message: 'Age is required' })
  age: number;

  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsNotEmpty({ message: 'Gender is required' })
  gender: string;
}
