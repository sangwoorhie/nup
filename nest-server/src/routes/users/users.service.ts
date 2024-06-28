import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 회원가입
  async signUp() {}

  // 로그인
  async signIn() {}

  // 내정보 조회
  async me() {}

  // 회원목록 조회
  async getUsers() {
    return this.userRepository.find({
      relations: {
        corporates: true,
      },
      select: {
        corporates: {
          id: true,
          corporate_name: true,
          industry_code: true,
          business_type: true,
          business_conditions: true,
          business_registration_number: true,
          business_license: true,
          address: true,
        },
      },
    });
  }
}
