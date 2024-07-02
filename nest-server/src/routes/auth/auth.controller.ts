import { Body, Controller, Headers, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  IndiSignUpReqDto,
  CorpSignUpReqDto,
  SignInReqDto,
} from './dto/req.dto';
import {
  CorpSignUpResDto,
  IndiSignUpResDto,
  RefreshResDto,
  SigninResDto,
} from './dto/res.dto';
import { ApiPostResponse } from 'src/decorators/swagger.decorators';
import { Public } from 'src/decorators/public.decorators';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';

@ApiTags('Auth')
@ApiExtraModels(
  IndiSignUpReqDto,
  CorpSignUpReqDto,
  SignInReqDto,
  IndiSignUpResDto,
  CorpSignUpResDto,
  SigninResDto,
  RefreshResDto,
) // DTO들 입력
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 1. 회원가입 (개인회원)
  // POST : localhost:3000/auth/signup1
  @Post('signup1')
  @Public()
  @ApiOperation({ summary: '회원가입 (개인회원)' })
  @ApiBody({ type: IndiSignUpReqDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: IndiSignUpResDto,
  })
  async IndisignUp(
    @Body() indiSignUpReqDto: IndiSignUpReqDto,
  ): Promise<IndiSignUpResDto> {
    const { id, accessToken, refreshToken } =
      await this.authService.IndisignUp(indiSignUpReqDto);
    return { id, accessToken, refreshToken };
  }

  // 2. 회원가입 (사업자회원)
  // POST : localhost:3000/auth/signup2
  @Post('signup2')
  @Public()
  @ApiOperation({ summary: '회원가입 (사업자회원)' })
  @ApiBody({ type: CorpSignUpReqDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: CorpSignUpResDto,
  })
  async CorpsignUp(
    @Body() corpSignUpReqDto: CorpSignUpReqDto,
  ): Promise<CorpSignUpResDto> {
    const { id, accessToken, refreshToken } =
      await this.authService.CorpsignUp(corpSignUpReqDto);
    return { id, accessToken, refreshToken };
  }

  // 3. 로그인
  // POST : localhost:3000/auth/signin
  @Post('signin')
  @Public()
  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: SignInReqDto })
  @ApiResponse({ status: 200, description: '로그인 성공', type: SigninResDto })
  async signIn(@Body() signInReqDto: SignInReqDto) {
    return this.authService.signIn(signInReqDto);
  }

  // 4. 리프레시토큰 발급
  // POST : localhost:3000/auth/refresh
  @Post('refresh')
  @ApiOperation({ summary: '리프레시토큰 발급' })
  @ApiBody({ type: RefreshResDto })
  @ApiResponse({
    status: 200,
    description: '토큰 발급 성공',
    type: RefreshResDto,
  })
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
