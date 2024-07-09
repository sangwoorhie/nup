import { UsersService } from './../users/users.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiKeySignInReqDto,
  CorpSignUpReqDto,
  IndiSignUpReqDto,
  SignInReqDto,
} from './dto/req.dto';
import { validateOrReject } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/entities/refresh_token.entity';
import { Repository, DataSource } from 'typeorm';
import { UserType } from 'src/enums/enums';
import { User } from 'src/entities/user.entity';
import { Corporate } from 'src/entities/corporate.entity';
import * as bcrypt from 'bcrypt';
import { TokenUsage } from 'src/entities/token_usage.entity';
import { ApiKeys } from 'src/entities/api_key.entity';
import { Log } from 'src/entities/log.entity';
import { Request } from 'express';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Corporate)
    private corporateRepository: Repository<Corporate>,
    @InjectRepository(TokenUsage)
    private tokenUsageRepository: Repository<TokenUsage>,
    @InjectRepository(ApiKeys)
    private apiKeysRepository: Repository<ApiKeys>,
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    private readonly mailerService: MailerService,
  ) {}

  // 1. 회원가입 (개인회원)
  async IndisignUp(indiSignUpReqDto: IndiSignUpReqDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const {
      email,
      password,
      confirmPassword,
      username,
      phone,
      emergency_phone,
      profile_image,
    } = indiSignUpReqDto;

    let error;
    try {
      await validateOrReject(indiSignUpReqDto); // 유효성 검사

      if (password !== confirmPassword) throw new BadRequestException();
      const user = await this.usersService.findOneByEmail(email);
      if (user) throw new BadRequestException();

      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);

      const userEntity = queryRunner.manager.create(User, {
        user_type: UserType.INDIVIDUAL,
        email,
        password: hash,
        username,
        phone,
        emergency_phone,
        profile_image,
      });
      await queryRunner.manager.save(userEntity);

      const accessToken = this.generateAccessToken(userEntity.id);
      const refreshToken = this.generateRefreshToken(userEntity.id);
      const refreshTokenEntity = queryRunner.manager.create(RefreshToken, {
        user: { id: userEntity.id },
        token: refreshToken,
      });
      await queryRunner.manager.save(refreshTokenEntity);
      await queryRunner.commitTransaction();
      return {
        id: userEntity.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 2. 회원가입 (사업자회원)
  async CorpsignUp(corpSignUpReqDto: CorpSignUpReqDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const {
      email,
      password,
      confirmPassword,
      username,
      phone,
      emergency_phone,
      profile_image,
      corporate_name,
      industry_code,
      business_type,
      business_conditions,
      business_registration_number,
      business_license,
      address,
    } = corpSignUpReqDto;

    let error;
    try {
      await validateOrReject(corpSignUpReqDto); // 유효성 검사

      if (password !== confirmPassword) {
        console.error('Passwords do not match');
        throw new BadRequestException(
          '비밀번호와 확인 비밀번호가 일치하지 않습니다.',
        );
      }

      const existingUser = await this.usersService.findOneByEmail(email);
      if (existingUser) {
        console.error('User with email already exists');
        throw new BadRequestException(
          '이미 동일한 이메일을 가진 회원이 존재합니다.',
        );
      }

      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);

      // User 엔티티 생성
      const userEntity = new User();
      userEntity.user_type = UserType.CORPORATE;
      userEntity.email = email;
      userEntity.password = hash;
      userEntity.username = username;
      userEntity.phone = phone;
      userEntity.emergency_phone = emergency_phone;
      userEntity.profile_image = profile_image;

      // User 엔티티 저장
      const savedUser = await queryRunner.manager.save(User, userEntity);

      // Corporate 엔티티 생성
      const corporateEntity = new Corporate();
      corporateEntity.corporate_name = corporate_name;
      corporateEntity.industry_code = industry_code;
      corporateEntity.business_type = business_type;
      corporateEntity.business_conditions = business_conditions;
      corporateEntity.business_registration_number =
        business_registration_number;
      corporateEntity.business_license = business_license;
      corporateEntity.address = address;
      corporateEntity.user = savedUser;

      // Corporate 엔티티 저장
      const savedCorporate = await queryRunner.manager.save(
        Corporate,
        corporateEntity,
      );

      // RefreshToken 엔티티 생성
      const refreshTokenEntity = new RefreshToken();
      refreshTokenEntity.user = savedUser;
      refreshTokenEntity.token = this.generateRefreshToken(savedUser.id);

      // RefreshToken 엔티티 저장
      const savedRefreshToken = await queryRunner.manager.save(
        RefreshToken,
        refreshTokenEntity,
      );

      const accessToken = this.generateAccessToken(savedUser.id);
      const refreshToken = savedRefreshToken.token;

      await queryRunner.commitTransaction();
      console.log('Transaction committed');

      return {
        id: savedUser.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (e) {
      console.error('Error occurred:', e);
      await queryRunner.rollbackTransaction();
      console.log('Transaction rolled back');
      error = e;
    } finally {
      await queryRunner.release();
      console.log('Query runner released');
      if (error) throw error;
    }
  }

  // 3. 로그인 (Email, Password)
  async signIn(signInReqDto: SignInReqDto, request: Request) {
    const { email, password } = signInReqDto;
    const user = await this.validateUser(email, password);
    if (user.banned) {
      throw new ForbiddenException('해당 계정은 정지되었습니다.');
    }
    const refreshToken = this.generateRefreshToken(user.id);
    await this.createRefreshTokenUsingUser(user.id, refreshToken);

    await this.logUserAccess(user, request.ip, request.headers['user-agent']);

    return {
      accessToken: this.generateAccessToken(user.id),
      refreshToken,
    };
  }

  // 4. 로그인 (API Key)
  async signInByApiKey(
    apiKeySignInReqDto: ApiKeySignInReqDto,
    request: Request,
  ) {
    const { apiKey } = apiKeySignInReqDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      // API Key 유효성 검사
      const apiKeyEntity = await this.apiKeysRepository.findOne({
        where: { api_key: apiKey },
        relations: ['user'],
      });
      if (!apiKeyEntity)
        throw new UnauthorizedException(
          `API-Key : ${apiKey} 유효한 API-Key가 아닙니다.`,
        );

      const user = apiKeyEntity.user;
      if (!user) throw new UnauthorizedException('회원을 찾을 수 없습니다.');

      // 유저의 banned 상태 확인
      if (user.banned)
        throw new ForbiddenException('해당 계정은 정지되었습니다.');

      // Token 생성
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);
      await this.createRefreshTokenUsingUser(user.id, refreshToken);

      // Token Usage 업데이트
      await this.updateTokenUsage(user);

      await this.logUserAccess(user, request.ip, request.headers['user-agent']);

      await queryRunner.commitTransaction();
      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // User Log 저장
  private async logUserAccess(user: User, ip: string, userAgent: string) {
    const log = this.logRepository.create({
      user: user,
      ip: ip,
      userAgent: userAgent,
    });
    await this.logRepository.save(log);
  }

  // 토큰 사용량 저장
  private async updateTokenUsage(user: User) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tokenUsage = await this.tokenUsageRepository.findOne({
      where: {
        user: { id: user.id },
        date: today,
      },
    });

    if (!tokenUsage) {
      tokenUsage = this.tokenUsageRepository.create({
        user,
        count: 1,
        date: today,
      });
    } else {
      tokenUsage.count += 1;
    }

    await this.tokenUsageRepository.save(tokenUsage);
  }

  // 5. 리프레시 토큰 발급 (리프레시토큰이 만료됬을 때 자동으로 호출함)
  async refresh(token: string, userId: string) {
    const refreshTokenEntity = await this.refreshTokenRepository.findOneBy({
      token,
    });
    if (!refreshTokenEntity) throw new BadRequestException();
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);
    refreshTokenEntity.token = refreshToken;
    await this.refreshTokenRepository.save(refreshTokenEntity);
    return { accessToken, refreshToken };
  }

  // 6. 로그아웃
  async signOut(userId: string) {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
    return { message: '로그아웃 되었습니다.' };
  }

  // 7. 비밀번호 재설정 (개인회원/사업자회원/관리자회원)
  async resetPassword(
    email: string,
    username: string,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const user = await this.usersService.findOneByEmailandName(
        email,
        username,
      );

      if (!user) {
        throw new NotFoundException('존재하지 않는 회원입니다.');
      }

      const newPassword = crypto.randomBytes(6).toString('base64');
      const hash = await bcrypt.hash(newPassword, 10);

      user.password = hash;
      await this.usersService.updateUser(user);

      await this.mailerService.sendMail({
        to: email,
        subject: '비밀번호 재설정 안내',
        template: '../src/templates/reset-password', // 이메일 템플릿 파일 경로
        context: {
          name: user.username,
          newPassword: newPassword,
        },
      });

      return { message: '비밀번호가 이메일로 전송되었습니다.' };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 액세스 토큰 생성
  private generateAccessToken(userId: string) {
    const payload = { sub: userId, tokenType: 'access' };
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  // 리프레시 토큰 생성
  private generateRefreshToken(userId: string) {
    const payload = { sub: userId, tokenType: 'refresh' };
    return this.jwtService.sign(payload, { expiresIn: '30d' });
  }

  /**
   * 사용자 ID와 리프레시 토큰을 사용하여 RefreshToken 엔티티를 생성하거나 업데이트함.
   * 만약 사용자에 대한 RefreshToken 엔티티가 이미 존재하면 토큰 값을 업데이트하고,
   * 존재하지 않으면 새로운 RefreshToken 엔티티를 생성함.
   *
   * @param userId - 사용자 ID
   * @param refreshToken - 새로 생성된 리프레시 토큰
   */

  private async createRefreshTokenUsingUser(
    userId: string,
    refreshToken: string,
  ) {
    let refreshTokenEntity = await this.refreshTokenRepository.findOneBy({
      user: { id: userId },
    });
    if (refreshTokenEntity) {
      refreshTokenEntity.token = refreshToken;
    } else {
      refreshTokenEntity = this.refreshTokenRepository.create({
        user: { id: userId },
        token: refreshToken,
      });
    }
    await this.refreshTokenRepository.save(refreshTokenEntity);
  }

  // 유저 유효성 검사
  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException();

    return user;
  }
}
