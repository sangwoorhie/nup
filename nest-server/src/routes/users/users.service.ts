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
  BanUserReqDto,
  ChangePasswordReqDto,
  DeleteUserReqDto,
  FindCorpUserReqDto,
  FindIndiUserReqDto,
  UpdateCorpUserReqDto,
  UpdateIndiUserReqDto,
  UpdatePointsReqDto,
} from './dto/req.dto';
import * as bcrypt from 'bcrypt';
import { PageResDto } from 'src/common/dto/res.dto';
import { FindCorpUserResDto, FindIndiUserResDto } from './dto/res.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Corporate)
    private readonly corporateRepository: Repository<Corporate>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. 본인정보 조회 (개인회원)
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

  // 2. 본인정보 조회 (사업자회원)
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
        'business_license_verified',
        'address',
      ],
    });

    if (user && corporate) {
      return { ...user, ...corporate };
    }
    return user;
  }

  // 3. 본인정보 수정 (개인회원)
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

  // 4. 본인정보 수정 (사업자회원)
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
        // 사업자등록증을 재업로드 했다면, 사업자등록증 관리자 확인을 미확인 처리
        if (business_license) {
          updatedCorporate.business_license_verified = false;
        }

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

  // 5. 비밀번호 변경 (개인회원/사업자회원/관리자회원)
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

  // 6. 회원 탈퇴 (개인회원/사업자회원/관리자회원)
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

  // 7. 개인회원 전체조회 (관리자)
  async findAll(
    page: number,
    size: number,
  ): Promise<PageResDto<FindIndiUserResDto>> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      select: [
        'email',
        'username',
        'phone',
        'emergency_phone',
        'point',
        'created_at',
      ],
    });

    return {
      page,
      size,
      total,
      items: users.map((user) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        emergency_phone: user.emergency_phone,
        point: user.point,
        created_at: user.created_at,
      })),
    };
  }

  // 8. 개인회원 단일조회 (관리자)
  async findIndiUser(findIndiUserReqDto: FindIndiUserReqDto) {
    const { criteria: searchCriteria, email, username } = findIndiUserReqDto;

    if (searchCriteria === 'email' && email) {
      return await this.userRepository.findOne({
        where: { email },
        select: [
          'id',
          'email',
          'username',
          'phone',
          'emergency_phone',
          'point',
          'created_at',
        ],
      });
    }

    if (searchCriteria === 'username' && username) {
      return await this.userRepository.findOne({
        where: { username },
        select: [
          'id',
          'email',
          'username',
          'phone',
          'emergency_phone',
          'point',
          'created_at',
        ],
      });
    }

    throw new BadRequestException('유효한 검색 기준과 값을 제공해야 합니다.');
  }

  // 9. 사업자회원 전체조회
  async findAllCorporateUsers(
    page: number,
    size: number,
  ): Promise<PageResDto<FindCorpUserResDto>> {
    const [corporates, total] = await this.corporateRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      relations: ['user'],
    });

    const items = corporates.map((corporate) => ({
      id: corporate.id,
      corporate_name: corporate.corporate_name,
      industry_code: corporate.industry_code,
      business_type: corporate.business_type,
      business_conditions: corporate.business_conditions,
      business_registration_number: corporate.business_registration_number,
      business_license: corporate.business_license,
      address: corporate.address,
      business_license_verified: corporate.business_license_verified,
      username: corporate.user.username,
      department: corporate.user.department,
      position: corporate.user.position,
      email: corporate.user.email,
      phone: corporate.user.phone,
      emergency_phone: corporate.user.emergency_phone,
      created_at: corporate.user.created_at,
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 10. 사업자회원 단일조회 (관리자)
  async findCorporateUser(
    findCorpUserReqDto: FindCorpUserReqDto,
  ): Promise<FindCorpUserResDto> {
    const { criteria, corporate_name, business_registration_number } =
      findCorpUserReqDto;

    if (criteria === 'corporate_name' && corporate_name) {
      const corporate = await this.corporateRepository.findOne({
        where: { corporate_name },
        relations: ['user'],
      });

      if (!corporate)
        throw new BadRequestException('존재하지 않는 기업명입니다.');

      return {
        id: corporate.id,
        corporate_name: corporate.corporate_name,
        industry_code: corporate.industry_code,
        business_type: corporate.business_type,
        business_conditions: corporate.business_conditions,
        business_registration_number: corporate.business_registration_number,
        business_license: corporate.business_license,
        address: corporate.address,
        business_license_verified: corporate.business_license_verified,
        username: corporate.user.username,
        department: corporate.user.department,
        position: corporate.user.position,
        email: corporate.user.email,
        phone: corporate.user.phone,
        emergency_phone: corporate.user.emergency_phone,
        created_at: corporate.user.created_at,
      };
    }

    if (
      criteria === 'business_registration_number' &&
      business_registration_number
    ) {
      const corporate = await this.corporateRepository.findOne({
        where: { business_registration_number },
        relations: ['user'],
      });

      if (!corporate)
        throw new BadRequestException('존재하지 않는 사업자등록번호입니다.');

      return {
        id: corporate.id,
        corporate_name: corporate.corporate_name,
        industry_code: corporate.industry_code,
        business_type: corporate.business_type,
        business_conditions: corporate.business_conditions,
        business_registration_number: corporate.business_registration_number,
        business_license: corporate.business_license,
        address: corporate.address,
        business_license_verified: corporate.business_license_verified,
        username: corporate.user.username,
        department: corporate.user.department,
        position: corporate.user.position,
        email: corporate.user.email,
        phone: corporate.user.phone,
        emergency_phone: corporate.user.emergency_phone,
        created_at: corporate.user.created_at,
      };
    }

    throw new BadRequestException('유효한 검색 기준과 값을 제공해야 합니다.');
  }

  // 11. 회원 계정정지 (관리자)
  async banUser(
    userId: string,
    banUserReqDto: BanUserReqDto,
  ): Promise<{ message: string }> {
    const { reason } = banUserReqDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('존재하지 않는 회원입니다.');

    user.banned = true;
    user.banned_reason = reason; // 계정정지 사유 저장
    await this.userRepository.save(user);

    return { message: '계정이 정지되었습니다.' };
  }

  // 12. 회원 계정정지 취소 (관리자)
  async unbanUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('존재하지 않는 회원입니다.');

    user.banned = false;
    user.banned_reason = null; // 계정정지 사유 제거
    await this.userRepository.save(user);

    return { message: '계정 정지가 해제되었습니다.' };
  }

  // 13. 관리자회원으로 변경 (관리자)
  async promoteUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('존재하지 않는 회원입니다.');

    user.user_type = UserType.ADMIN;
    await this.userRepository.save(user);

    return { message: '회원이 관리자 계정으로 변경되었습니다.' };
  }

  // 14. 사업자등록증 확인처리 (관리자)
  async verifyBusinessLicense(
    corporateId: string,
  ): Promise<{ message: string }> {
    const corporate = await this.corporateRepository.findOne({
      where: { id: corporateId },
    });
    if (!corporate)
      throw new UnauthorizedException('존재하지 않는 사업자회원입니다.');

    corporate.business_license_verified = true;
    await this.corporateRepository.save(corporate);

    return { message: '사업자등록증이 확인처리 되었습니다.' };
  }

  // 15. 포인트 충전/차감 (관리자)
  async updatePoints(
    userId: string,
    updatePointsReqDto: UpdatePointsReqDto,
  ): Promise<{ message: string }> {
    const { points } = updatePointsReqDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('존재하지 않는 회원입니다.');

    user.point += points;
    await this.userRepository.save(user);

    return { message: '포인트가 업데이트되었습니다.' };
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
