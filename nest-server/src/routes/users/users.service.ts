import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 회원가입
  async createIndiUser(
    email: string,
    password: string,
    username: string,
    phone: number,
    emergency_phone: number,
    profile_image: string,
  ) {
    const user = this.userRepository.create({
      email,
      password,
      username,
      phone,
      emergency_phone,
      profile_image,
    });
    await this.userRepository.save(user);
    return user;
  }

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

  // 이메일로 회원찾기
  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }
}
