import { Body, Controller, Headers, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  IndiSignUpReqDto,
  CorpSignUpReqDto,
  SignInReqDto,
} from './dto/req.dto';
import {
  IndividualSignUpResDto,
  RefreshResDto,
  SigninResDto,
} from './dto/res.dto';
import { ApiPostResponse } from 'src/decorators/swagger.decorators';
import { Public } from 'src/decorators/public.decorators';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';

@ApiTags('Auth')
@ApiExtraModels(IndiSignUpReqDto, SigninResDto) // DTO들 입력
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 개인 회원가입 [POST : localhost:3000/auth/indisignup]
  @Post('indisignup')
  @Public()
  @ApiPostResponse(IndiSignUpReqDto)
  async IndisignUp(@Body() indiSignUpReqDto: IndiSignUpReqDto) {
    const { id } = await this.authService.IndisignUp(indiSignUpReqDto);
    return { id };
  }

  // 사업자 회원가입 [POST : localhost:3000/auth/corpsignup]
  @Post('corpsignup')
  @Public()
  @ApiPostResponse(IndiSignUpReqDto)
  async CorpsignUp(@Body() corpSignUpReqDto: CorpSignUpReqDto) {
    // const { id } = await this.authService.CorpsignUp(corpSignUpReqDto);
    // return { id };
  }

  // 로그인 [POST : localhost:3000/auth/signin]
  @Post('signin')
  @Public()
  @ApiPostResponse(SigninResDto)
  async signIn(@Body() signInReqDto: SignInReqDto) {
    return this.authService.signIn(signInReqDto);
  }

  // 리프레시토큰 발급 [POST : localhost:3000/auth/refresh]
  @Post('refresh')
  @ApiPostResponse(RefreshResDto)
  async refresh(
    @Headers('authorization') authorization,
    @User() user: UserAfterAuth,
  ) {
    const token = /Bearer\s(.+)/.exec(authorization)[1];
    const { accessToken, refreshToken } = await this.authService.refresh(
      token,
      user.id,
    );
    return { accessToken, refreshToken };
  }
}

// 스웨거 상 인증을 거쳐야 함
// @ApiBearerAuth()
