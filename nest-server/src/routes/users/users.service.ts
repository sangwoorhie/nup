import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
  FindAdminUserReqDto,
  FindCorpUserReqDto,
  FindIndiUserReqDto,
  UpdateCorpUserReqDto,
  UpdateIndiUserReqDto,
  UpdatePointsReqDto,
} from './dto/req.dto';
import * as bcrypt from 'bcrypt';
import { PageResDto } from 'src/common/dto/res.dto';
import {
  FindAdminUserResDto,
  FindCorpUserResDto,
  FindIndiUserResDto,
} from './dto/res.dto';
import { createTransporter } from 'src/config/mailer.config';
import * as moment from 'moment';

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

  // 프로필이미지 조회 가능 코드
  // async findIndiUserInfo(userId: string) {
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //     select: [
  //       'email',
  //       'username',
  //       'phone',
  //       'emergency_phone',
  //       'profile_image',
  //     ],
  //   });
  //   return {
  //     ...user,
  //     profile_image_url: user.profile_image,
  //   };
  // }

  // 2. 본인정보 조회 (사업자회원)
  async findCorpUserInfo(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['corporate'],
    });

    if (!user || !user.corporate) {
      throw new BadRequestException('해당 사용자 정보를 찾을 수 없습니다.');
    }

    const corporate = user.corporate;

    return {
      id: user.id,
      corporate_name: corporate.corporate_name,
      business_type: corporate.business_type,
      business_conditions: corporate.business_conditions,
      business_registration_number: corporate.business_registration_number,
      business_license: corporate.business_license,
      business_license_verified: corporate.business_license_verified,
      address: corporate.address,
      username: user.username,
      department: user.department,
      position: user.position,
      email: user.email,
      phone: user.phone,
      emergency_phone: user.emergency_phone,
      created_at: user.created_at,
    };
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
    const { newPassword, newPasswordConfirm } = changePasswordReqDto;

    if (newPassword !== newPasswordConfirm) {
      throw new BadRequestException(
        '새 비밀번호와, 새 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('해당 회원이 존재하지 않습니다.');
    }
    // const isMatch = await bcrypt.compare(currentPassword, user.password);

    // if (!isMatch) {
    //   throw new UnauthorizedException('현재 비밀번호가 올바르지 않습니다.');
    // }

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
  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('해당 회원이 존재하지 않습니다.');
    }
    // const isMatch = await bcrypt.compare(
    //   deleteUserReqDto.password,
    //   user.password,
    // );
    // if (!isMatch)
    //   throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');

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
      where: { user_type: UserType.INDIVIDUAL },
      select: [
        'id',
        'email',
        'username',
        'phone',
        'emergency_phone',
        'point',
        'banned',
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
        banned: user.banned,
        created_at: user.created_at,
      })),
    };
  }

  // 8. 개인회원 단일조회 (관리자)
  async findIndiUser(
    findIndiUserReqDto: FindIndiUserReqDto,
    page: number,
    size: number,
  ): Promise<PageResDto<FindIndiUserResDto>> {
    const { criteria, email, username } = findIndiUserReqDto;

    let whereCondition: any = {};

    if (criteria === 'email' && email) {
      whereCondition.email = email;
    } else if (criteria === 'username' && username) {
      whereCondition.username = username;
    } else {
      throw new BadRequestException('유효한 검색 기준과 값을 제공해야 합니다.');
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: {
        ...whereCondition,
        user_type: UserType.INDIVIDUAL,
      },
      skip: (page - 1) * size,
      take: size,
      select: [
        'id',
        'email',
        'username',
        'phone',
        'emergency_phone',
        'point',
        'banned',
        'created_at',
      ],
    });

    if (users.length === 0) {
      throw new NotFoundException('해당 조건에 맞는 회원을 찾을 수 없습니다.');
    }

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
        banned: user.banned,
        created_at: user.created_at,
      })),
    };
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
      banned: corporate.user.banned,
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
    page: number,
    size: number,
  ): Promise<PageResDto<FindCorpUserResDto>> {
    const { criteria, corporate_name, business_registration_number } =
      findCorpUserReqDto;

    let whereCondition: any = {};

    if (criteria === 'corporate_name' && corporate_name) {
      whereCondition.corporate_name = corporate_name;
    } else if (
      criteria === 'business_registration_number' &&
      business_registration_number
    ) {
      whereCondition.business_registration_number =
        business_registration_number;
    } else {
      throw new BadRequestException('유효한 검색 기준과 값을 제공해야 합니다.');
    }

    const [corporates, total] = await this.corporateRepository.findAndCount({
      where: {
        ...whereCondition,
        // user_type: UserType.CORPORATE,
      },
      skip: (page - 1) * size,
      take: size,
      select: [
        'id',
        'corporate_name',
        'business_type',
        'business_conditions',
        'business_registration_number',
        'business_license',
        'address',
        'business_license_verified',
      ],
      relations: ['user'],
    });

    if (corporates.length === 0) {
      throw new NotFoundException('해당 조건에 맞는 기업을 찾을 수 없습니다.');
    }

    return {
      page,
      size,
      total,
      items: corporates.map((corporate) => ({
        id: corporate.id,
        corporate_name: corporate.corporate_name,
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
        banned: corporate.user.banned,
        created_at: corporate.user.created_at,
      })),
    };
  }

  // 11. 관리자 회원 전체조회 (관리자)
  async findAllAdmins(
    page: number,
    size: number,
  ): Promise<PageResDto<FindAdminUserResDto>> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      where: { user_type: UserType.ADMIN },
      select: [
        'id',
        'email',
        'username',
        'phone',
        'emergency_phone',
        'created_at',
      ],
    });

    const items = users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      emergency_phone: user.emergency_phone,
      created_at: user.created_at,
    }));

    return {
      page,
      size,
      total,
      items: items,
    };
  }

  // 12. 관리자 회원 단일조회 (관리자)
  async findAdminUser(
    findAdminUserReqDto: FindAdminUserReqDto,
    page: number,
    size: number,
  ): Promise<PageResDto<FindAdminUserResDto>> {
    const { criteria, email, username } = findAdminUserReqDto;
    let whereCondition: any = {};

    if (criteria === 'email' && email) {
      whereCondition.email = email;
    } else if (criteria === 'username' && username) {
      whereCondition.username = username;
    } else {
      throw new BadRequestException('유효한 검색 기준과 값을 제공해야 합니다.');
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: {
        ...whereCondition,
        user_type: UserType.ADMIN,
      },
      skip: (page - 1) * size,
      take: size,
      select: [
        'id',
        'email',
        'username',
        'phone',
        'emergency_phone',
        'created_at',
      ],
    });

    if (users.length === 0) {
      throw new NotFoundException('해당 조건에 맞는 회원을 찾을 수 없습니다.');
    }

    const items = users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      emergency_phone: user.emergency_phone,
      created_at: user.created_at,
    }));

    return {
      page,
      size,
      total,
      items: items,
    };
  }

  // 13. 회원 계정정지 (관리자)
  async banUser(
    userId: string,
    banUserReqDto: BanUserReqDto,
  ): Promise<{ message: string }> {
    const { reason } = banUserReqDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('존재하지 않는 회원입니다.');

    user.banned = !user.banned;
    user.banned_reason = user.banned ? reason : null; // 계정정지 사유 저장 또는 제거
    const username = user.username;
    await this.userRepository.save(user);

    return {
      message: `username: ${username} 계정이 ${user.banned ? '정지' : '정지 해제'}되었습니다.`,
    };
  }

  // 14. 회원 계정정지 취소 (관리자)
  async unbanUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('존재하지 않는 회원입니다.');

    if (!user.banned) {
      throw new BadRequestException('계정이 정지되지 않은 회원입니다.');
    }

    user.banned = false;
    user.banned_reason = null; // 계정정지 사유 제거
    const username = user.username;
    await this.userRepository.save(user);

    return { message: `username: ${username} 계정 정지가 해제되었습니다.` };
  }

  // 15. 관리자회원으로 변경 (관리자)
  async promoteUser(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('존재하지 않는 회원입니다.');

    if (user.user_type === UserType.ADMIN) {
      throw new BadRequestException('이미 관리자 회원입니다.');
    }

    user.user_type = UserType.ADMIN;
    const username = user.username;
    await this.userRepository.save(user);

    return {
      message: `username: ${username} 회원이 관리자 회원으로 변경되었습니다.`,
    };
  }

  // 16. 미확인 사업자등록증 확인처리 (관리자)
  async verifyBusinessLicense(
    corporateId: string,
  ): Promise<{ message: string }> {
    const corporate = await this.corporateRepository.findOne({
      where: { id: corporateId },
    });
    if (!corporate)
      throw new UnauthorizedException('존재하지 않는 사업자회원입니다.');

    if (corporate.business_license_verified)
      throw new BadRequestException('이미 확인처리 된 사업자등록증입니다.');

    corporate.business_license_verified = true;
    const companyName = corporate.corporate_name;
    await this.corporateRepository.save(corporate);

    return {
      message: `기업 명 : ${companyName} 사업자등록증이 확인처리 되었습니다.`,
    };
  }

  // 17. 포인트 충전/차감 (관리자)
  async updatePoints(
    userId: string,
    updatePointsReqDto: UpdatePointsReqDto,
  ): Promise<{ message: string }> {
    const { points } = updatePointsReqDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('존재하지 않는 회원입니다.');

    // 포인트 차감 조건 확인
    if (points < 0) {
      if (user.point <= 0) {
        throw new BadRequestException(
          `회원의 현재 포인트가 ${user.point}P입니다. 0 또는 음수 이므로 포인트를 차감할 수 없습니다.`,
        );
      }
      if (user.point + points < 0) {
        throw new BadRequestException(
          `차감하고자 하는 포인트(${points}P)가 회원의 현재 포인트(${user.point}P)보다 큽니다.`,
        );
      }
    }

    user.point += points;
    await this.userRepository.save(user);

    const message =
      points < 0
        ? `${points}포인트가 차감되었습니다.`
        : `${points}포인트가 충전되었습니다.`;
    return { message };
  }

  // 18. 정보 수정, 삭제 시 비밀번호로 본인 일치 조회 (사용자, 관리자)
  async doubleCheckPassword(
    userId: string,
    password: string,
  ): Promise<{ message: string }> {
    const user = await this.findOneById(userId);
    if (!user) throw new UnauthorizedException('존재하지 않는 회원압니다.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('올바른 비밀번호가 아닙니다.');
    if (isMatch) return { message: '비밀번호가 확인되었습니다.' };
  }

  // 이메일로 회원찾기
  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  // 이메일과 이름으로 회원찾기
  async findOneByEmailandName(
    email: string,
    username: string,
  ): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email, username } });
  }

  // 아이디로 회원찾기
  async findOneById(id: string) {
    return await this.userRepository.findOneBy({ id });
  }

  // E-mail 중복검사
  async emailCheck(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      return `Email : ${email} 은 사용할 수 있는 E-mail입니다.`;
    }
    throw new BadRequestException(`Email : ${email}은 이미 사용 중입니다.`);
  }

  // 관리자 회원 검증
  async checkUserIsAdmin(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    return user.user_type === UserType.ADMIN;
  }

  // 비밀번호 재설정
  async updateUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
