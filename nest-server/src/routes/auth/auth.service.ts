import { UsersService } from './../users/users.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
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
  ) {}

  // 1. 개인 회원가입
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

  // 2. 사업자 회원가입
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

      if (password !== confirmPassword) throw new BadRequestException();
      const user = await this.usersService.findOneByEmail(email);
      if (user) throw new BadRequestException();

      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);

      const userEntity = queryRunner.manager.create(User, {
        user_type: UserType.CORPORATE,
        email,
        password: hash,
        username,
        phone,
        emergency_phone,
        profile_image,
      });
      await queryRunner.manager.save(userEntity);

      const corporateEntity = queryRunner.manager.create(Corporate, {
        corporate_name,
        industry_code,
        business_type,
        business_conditions,
        business_registration_number,
        business_license,
        address,
        user: userEntity,
      });
      await queryRunner.manager.save(corporateEntity);

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

  // 3. 로그인
  async signIn(signInReqDto: SignInReqDto) {
    const { email, password } = signInReqDto;
    const user = await this.validateUser(email, password);

    const refreshToken = this.generateRefreshToken(user.id);
    await this.createRefreshTokenUsingUser(user.id, refreshToken);
    return {
      accessToken: this.generateAccessToken(user.id),
      refreshToken,
    };
  }

  // 4. 리프레시 토큰 발급 (리프레시토큰이 만료됬을 때 자동으로 호출함)
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
