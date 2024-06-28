import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 회원가입
  async signUp() {}

  // 로그인
  async signIn() {}

  // 내정보 조회
  async me() {}

  // 회원목록 조회
  @Get()
  async getUsers() {
    return await this.usersService.getUsers();
  }
}
