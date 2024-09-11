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
  SocialCorpSignUpReqDto,
  SocialIndiSignUpReqDto,
  VerifyAuthNumberDto,
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
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { createTransporter } from 'src/config/mailer.config';
import { OAuth2Client } from 'google-auth-library';

interface GoogleJwtPayload extends jwt.JwtPayload {
  email: string;
  given_name: string;
  family_name: string;
  picture: string;
}

@Injectable()
export class AuthService {
  private authNumbers = new Map<
    string,
    { authNumber: string; expiresAt: Date }
  >();

  private client: OAuth2Client;

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
  ) {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

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
      userEntity.is_signup_completed = true;
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
      corporate_type,
      email,
      password,
      confirmPassword,
      username,
      phone,
      emergency_phone,
      corporate_name,
      business_type,
      business_conditions,
      business_registration_number,
      address,
      profile_image,
      business_license,
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
      userEntity.is_signup_completed = true;

      // User 엔티티 저장
      const savedUser = await queryRunner.manager.save(User, userEntity);

      // Corporate 엔티티 생성
      const corporateEntity = new Corporate();
      corporateEntity.corporate_type = corporate_type;
      corporateEntity.corporate_name = corporate_name;
      corporateEntity.business_type = business_type;
      corporateEntity.business_conditions = business_conditions;
      corporateEntity.business_registration_number =
        business_registration_number;
      corporateEntity.address = address;
      corporateEntity.business_license = business_license;
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

    const clientIp = this.getClientIp(request);
    await this.logUserAccess(user, clientIp, request.headers['user-agent']);

    return {
      accessToken: this.generateAccessToken(user.id),
      refreshToken: refreshToken,
      userType: user.user_type,
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

      const clientIp = this.getClientIp(request);
      await this.logUserAccess(user, clientIp, request.headers['user-agent']);

      await queryRunner.commitTransaction();
      return {
        accessToken: accessToken,
        refreshToken: accessToken,
        userType: user.user_type,
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
    // Get current date and time in UTC
    const utcNow = new Date();

    // Convert UTC time to Korean Standard Time (KST)
    // const kstOffset = 9 * 60; // KST is UTC+9
    // const kstNow = new Date(utcNow.getTime() + kstOffset * 60000);

    const log = this.logRepository.create({
      user: user,
      ip: ip,
      userAgent: userAgent,
      loginTimestamp: utcNow,
    });

    await this.logRepository.save(log);
  }

  // 유저 IP 추출
  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    let ip = '';

    if (typeof forwarded === 'string') {
      ip = forwarded.split(',')[0].trim();
    } else {
      ip = request.socket.remoteAddress || request.ip;
    }

    // Handle IPv6 addresses and convert them to IPv4 if needed
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      ip = '127.0.0.1'; // Localhost IPv4 address
    }

    return ip;
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
    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: { token, user: { id: userId } },
      relations: ['user'],
    });
    if (!refreshTokenEntity) {
      throw new BadRequestException('Invalid refresh token');
    }

    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    // Update the refresh token entity with the new refresh token
    refreshTokenEntity.token = refreshToken;
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return { accessToken, refreshToken, user };
  }

  // 6. 로그아웃
  async signOut(userId: string) {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
    return { message: '로그아웃 되었습니다.' };
  }

  // 7. 임시 비밀번호 발급 (개인회원/사업자회원/관리자회원)
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
        throw new NotFoundException('회원 정보를 찾을 수 없습니다.');
      }

      const newPassword = crypto.randomBytes(6).toString('base64');
      const hash = await bcrypt.hash(newPassword, 10);

      user.password = hash;
      await this.usersService.updateUser(user);

      const transporter = createTransporter();

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: '[KO-MAPPER AI] 임시 비밀번호 발급 안내',
        html: `<p>안녕하세요, ${user.username}님.</p>
               <p>요청하신 임시 비밀번호가 발급되었습니다. 새로운 비밀번호는 아래와 같습니다:</p>
               <p><strong>${newPassword}</strong></p>
               <p>로그인 후 비밀번호를 변경하는 것을 권장드립니다.</p>
               <p>감사합니다.</p>`,
      });

      await queryRunner.commitTransaction();
      return { message: '비밀번호가 이메일로 전송되었습니다.' };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error('Error in resetPassword:', e);
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 9. 회원가입시 이메일로 인증번호 전송 (5분 시간제한)
  async sendAuthenticationNumber(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (user) throw new BadRequestException('동일한 이메일이 이미 존재합니다');

    const authNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Set expiration time to 5 minutes from now
    this.authNumbers.set(email, { authNumber, expiresAt });

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: '[KO-MAPPER AI] 회원가입 인증번호를 보내드립니다.',
      text: `회원가입 인증번호 : ${authNumber}`,
    };

    await transporter.sendMail(mailOptions);
    return { message: '인증번호가 이메일로 전송되었습니다.' };
  }

  // 10. 회원가입시 이메일로 전송된 인증번호 확인 (5분 시간제한)
  async verifyAuthenticationNumber({
    email,
    authNumber,
  }: VerifyAuthNumberDto): Promise<{ message: string }> {
    const storedData = this.authNumbers.get(email);
    if (!storedData) {
      throw new BadRequestException('유효하지 않은 인증번호입니다.');
    }

    const { authNumber: storedNumber, expiresAt } = storedData;
    if (new Date() > expiresAt) {
      this.authNumbers.delete(email);
      throw new BadRequestException(
        '인증번호 유효시간이 경과되어 만료되었습니다.',
      );
    }

    if (storedNumber !== authNumber) {
      throw new BadRequestException('유효하지 않은 인증번호입니다.');
    }

    this.authNumbers.delete(email);
    return { message: '인증번호가 확인되었습니다.' };
  }

  // * 구글 계정 확인 (ID token)
  async verifyGoogleCredential(credential: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google credential payload');
    }

    // Optional: Additional checks (e.g., email_verified)
    if (!payload.email_verified) {
      throw new Error('Email not verified by Google');
    }
    return payload; // Contains user information like email, name, sub (Google ID)
  }

  // 11. 구글 소셜로그인
  async googleLogin(googleUser: any) {
    const { email, name } = googleUser;

    let user = await this.usersService.findOneByEmail(email);

    let isNewUser = false;
    let userType: UserType | null = null;
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (!user) {
      // New user: create a temporary user
      isNewUser = true;
      user = await this.usersService.saveUser(email, name);
      userType = null; // To be set via signup modal
    } else if (!user.is_signup_completed) {
      // Existing user but signup not completed
      isNewUser = true;
      userType = null;
    } else {
      // Existing user: generate tokens
      const userId = user.id;
      accessToken = this.generateAccessToken(userId);
      refreshToken = this.generateRefreshToken(userId);
      userType = user.user_type;
    }
    return { user, isNewUser, userType, accessToken, refreshToken };
    // if (isNewUser) {
    //   return { user, isNewUser, userType };
    // } else {
    //   return { user, isNewUser, userType, accessToken, refreshToken };
    // }
  }

  // 12. 네이버, 구글 소셜로그인 - 개인 회원가입
  async completeIndiSignUp(
    userId: string,
    socialIndiSignUpReqDto: SocialIndiSignUpReqDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 추가 정보 업데이트
      const { phone, emergency_phone, profile_image, username } =
        socialIndiSignUpReqDto;

      user.user_type = UserType.INDIVIDUAL;
      user.username = username;
      user.phone = phone;
      user.emergency_phone = emergency_phone;
      user.profile_image = profile_image;
      user.is_signup_completed = true;

      // 업데이트된 유저 정보 저장
      await queryRunner.manager.save(User, user);

      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);
      const refreshTokenEntity = queryRunner.manager.create(RefreshToken, {
        user: { id: user.id },
        token: refreshToken,
      });
      await queryRunner.manager.save(RefreshToken, refreshTokenEntity);
      await queryRunner.commitTransaction();

      return {
        id: user.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
      throw e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // 13. 네이버, 구글 소셜로그인 - 사업자 회원가입
  async completeCorpSignUp(
    userId: string,
    socialCorpSignUpReqDto: SocialCorpSignUpReqDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let error;
    try {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      const {
        username,
        phone,
        emergency_phone,
        profile_image,
        corporate_type,
        corporate_name,
        business_type,
        business_conditions,
        business_registration_number,
        address,
        business_license,
      } = socialCorpSignUpReqDto;

      // User 추가 정보 업데이트
      user.user_type = UserType.CORPORATE;
      user.username = username;
      user.phone = phone;
      user.emergency_phone = emergency_phone;
      user.profile_image = profile_image;
      user.is_signup_completed = true;

      // 업데이트된 유저 정보 저장
      const savedUser = await queryRunner.manager.save(User, user);

      // Corporate 엔티티 생성 및 정보 저장
      const corporateEntity = new Corporate();
      corporateEntity.corporate_type = corporate_type;
      corporateEntity.corporate_name = corporate_name;
      corporateEntity.business_type = business_type;
      corporateEntity.business_conditions = business_conditions;
      corporateEntity.business_registration_number =
        business_registration_number;
      corporateEntity.address = address;
      corporateEntity.business_license = business_license;
      corporateEntity.user = savedUser;

      // Corporate 정보 저장
      const savedCorporate = await queryRunner.manager.save(
        Corporate,
        corporateEntity,
      );

      // RefreshToken 생성 및 저장
      const accessToken = this.generateAccessToken(savedUser.id);
      const refreshToken = this.generateRefreshToken(savedUser.id);
      const refreshTokenEntity = queryRunner.manager.create(RefreshToken, {
        user: { id: savedUser.id },
        token: refreshToken,
      });
      await queryRunner.manager.save(RefreshToken, refreshTokenEntity);

      await queryRunner.commitTransaction();

      return {
        id: savedUser.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
      throw e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  // * 네이버 계정 확인
  async getNaverUserInfo(code: string, state: string) {
    const tokenResponse = await axios.get(
      'https://nid.naver.com/oauth2.0/token',
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.NAVER_CLIENT_ID,
          client_secret: process.env.NAVER_CLIENT_SECRET,
          code,
          state,
        },
      },
    );

    const { access_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      'https://openapi.naver.com/v1/nid/me',
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    return userInfoResponse.data.response;
  }

  // 14. 네이버 소셜로그인
  async naverLogin(naverUser: any) {
    const { email, name } = naverUser;

    let user = await this.usersService.findOneByEmail(email);

    let isNewUser = false;
    let userType: UserType | null = null;
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (!user) {
      isNewUser = true;
      user = await this.usersService.saveUser(email, name);
      userType = null;
    } else if (!user.is_signup_completed) {
      isNewUser = true;
      userType = null;
    } else {
      const userId = user.id;
      accessToken = this.generateAccessToken(userId);
      refreshToken = this.generateRefreshToken(userId);
      userType = user.user_type;
    }
    return { user, isNewUser, userType, accessToken, refreshToken };
  }

  // * 이메일과 이름으로 유저 찾기
  async findOneByEmailandName(
    email: string,
    username: string,
  ): Promise<User | undefined> {
    return await this.usersService.findOneByEmailandName(email, username);
  }

  // * 비밀번호 재설정
  async updateUser(user: User): Promise<User> {
    return this.usersService.updateUser(user);
  }

  // * 액세스 토큰 생성
  private generateAccessToken(userId: string) {
    const payload = { sub: userId, tokenType: 'access' };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  }

  // * 리프레시 토큰 생성
  private generateRefreshToken(userId: string) {
    const payload = { sub: userId, tokenType: 'refresh' };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
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

  // * 유저 유효성 검사
  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException();

    return user;
  }
}
