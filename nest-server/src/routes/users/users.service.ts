import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserType } from 'src/enums/enums';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 유저 전체조회
  async findAll(page: number, size: number) {
    return this.userRepository.find({
      skip: (page - 1) * size,
      take: size,
    });
  }

  // 이메일로 회원찾기
  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  // 관리자 회원 검증
  async checkUserIsAdmin(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    return user.user_type === UserType.ADMIN;
  }
}
