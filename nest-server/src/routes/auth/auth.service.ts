import { UsersService } from './../users/users.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IndiSignUpReqDto, SignInReqDto } from './dto/req.dto';
import { validateOrReject } from 'class-validator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    return null;
  }

  // 개인 회원가입
  async IndisignUp(indiSignUpReqDto: IndiSignUpReqDto) {
    const {
      email,
      password,
      confirmPassword,
      username,
      phone,
      emergency_phone,
      profile_image,
    } = indiSignUpReqDto;

    try {
      await validateOrReject(indiSignUpReqDto); // 유효성 검사

      if (password !== confirmPassword) throw new BadRequestException();
      const user = await this.usersService.findOneByEmail(email);
      if (user) throw new BadRequestException();
      const newUser = await this.usersService.createIndiUser(
        email,
        password,
        username,
        phone,
        emergency_phone,
        profile_image,
      );
      return newUser;
    } catch (errors) {
      throw new BadRequestException(errors);
    }
  }

  // 사업자 회원가입

  // 로그인
  async signIn(signInReqDto: SignInReqDto) {
    const { email, password } = signInReqDto;
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isMatch = password == user.password;
    if (!isMatch) throw new UnauthorizedException();
    return {
      accessToken: this.jwtService.sign({ sub: user.id }),
    };
  }
}
