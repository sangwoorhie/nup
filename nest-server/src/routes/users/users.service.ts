import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Corporate } from 'src/entities/corporate.entity';
import { User } from 'src/entities/user.entity';
import { UserType } from 'src/enums/enums';
import { DataSource, Repository } from 'typeorm';
import {
  ChangePasswordReqDto,
  DeleteUserReqDto,
  UpdateCorpUserReqDto,
  UpdateIndiUserReqDto,
} from './dto/req.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Corporate)
    private readonly corporateRepository: Repository<Corporate>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. 개인 회원 정보 조회
  async findIndiUserInfo(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'email',
        'username',
        'phone',
        'emergency_phone',
        'profile_image',
      ],
    });
  }

  // 2. 사업자회원 정보 조회
  async findCorpUserInfo(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'email',
        'username',
        'phone',
        'emergency_phone',
        'profile_image',
        'department',
        'position',
      ],
    });

    const corporate = await this.corporateRepository.findOne({
      where: { user: { id: userId } },
      select: [
        'corporate_name',
        'industry_code',
        'business_type',
        'business_conditions',
        'business_registration_number',
        'business_license',
        'address',
      ],
    });

    if (user && corporate) {
      return { ...user, ...corporate };
    }
    return user;
  }
  // 3. 개인회원 정보 수정
  async updateIndiUserInfo(
    userId: string,
    updateIndiUserReqDto: UpdateIndiUserReqDto,
  ) {
    const { username, phone, emergency_phone, profile_image } =
      updateIndiUserReqDto;
    await this.userRepository.update(userId, {
      username,
      phone,
      emergency_phone,
      profile_image,
    });
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    updatedUser.username = username;
    updatedUser.phone = phone;
    updatedUser.emergency_phone = emergency_phone;
    updatedUser.profile_image = profile_image;

    await this.userRepository.save(updatedUser);
    return this.findIndiUserInfo(userId);
  }

  // 4. 사업자회원 정보 수정
  async updateCorpUserInfo(
    userId: string,
    updateCorpUserReqDto: UpdateCorpUserReqDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const {
      corporate_name,
      industry_code,
      business_type,
      business_conditions,
      business_registration_number,
      business_license,
      address,
      ...userDetails
    } = updateCorpUserReqDto;

    let error;
    try {
      // 사용자 정보 업데이트
      await this.userRepository.update(userId, userDetails);

      // 사용자 엔티티 다시 가져와서 저장
      const updatedUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      Object.assign(updatedUser, userDetails);
      await this.userRepository.save(updatedUser);

      // 기업 정보 업데이트
      if (
        corporate_name ||
        industry_code ||
        business_type ||
        business_conditions ||
        business_registration_number ||
        business_license ||
        address
      ) {
        await this.corporateRepository.update(
          { user: { id: userId } },
          {
            corporate_name: corporate_name,
            industry_code: industry_code,
            business_type: business_type,
            business_conditions: business_conditions,
            business_registration_number: business_registration_number,
            business_license: business_license,
            address: address,
          },
        );

        // 기업 엔티티 다시 가져와서 저장
        const updatedCorporate = await this.corporateRepository.findOne({
          where: { user: { id: userId } },
        });
        Object.assign(updatedCorporate, {
          corporate_name,
          industry_code,
          business_type,
          business_conditions,
          business_registration_number,
          business_license,
          address,
        });
        await this.corporateRepository.save(updatedCorporate);
      }

      await queryRunner.commitTransaction();
      return this.findCorpUserInfo(userId);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 5. 비밀번호 변경
  async changePassword(
    userId: string,
    changePasswordReqDto: ChangePasswordReqDto,
  ) {
    const { currentPassword, newPassword, newPasswordConfirm } =
      changePasswordReqDto;

    if (newPassword !== newPasswordConfirm) {
      throw new BadRequestException(
        '새 비밀번호와, 새 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(userId, { password: hash });

    // 엔티티를 다시 가져와서 저장
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    updatedUser.password = hash;
    await this.userRepository.save(updatedUser);

    return { message: '비밀번호가 변경되었습니다.' };
  }

  // 6. 회원 탈퇴
  async deleteUser(userId: string, deleteUserReqDto: DeleteUserReqDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const isMatch = await bcrypt.compare(
      deleteUserReqDto.password,
      user.password,
    );
    if (!isMatch)
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');

    await this.userRepository.softDelete(userId);
    return { message: '회원 탈퇴되었습니다.' };
  }

  // 7. 유저 전체조회
  async findAll(page: number, size: number) {
    return await this.userRepository.find({
      skip: (page - 1) * size,
      take: size,
    });
  }

  // 8. 단일유저 조회

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
