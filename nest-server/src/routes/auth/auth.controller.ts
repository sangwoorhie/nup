import {
  Body,
  Controller,
  Delete,
  Headers,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
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
  ApiKeySignInReqDto,
  ResetPasswordReqDto,
} from './dto/req.dto';
import {
  CorpSignUpResDto,
  IndiSignUpResDto,
  RefreshResDto,
  ResetPasswordResDto,
  SigninResDto,
} from './dto/res.dto';
import { ApiPostResponse } from 'src/decorators/swagger.decorators';
import { Public } from 'src/decorators/public.decorators';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
// import { multerOptions } from 'src/common/multer.options';

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
  // @UseInterceptors(FileInterceptor('profile_image', multerOptions))
  @ApiOperation({ summary: '회원가입 (개인회원)' })
  @ApiBody({ type: IndiSignUpReqDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: IndiSignUpResDto,
  })
  async IndisignUp(
    @Body() indiSignUpReqDto: IndiSignUpReqDto,
    // @UploadedFile() profileImage: Express.MulterS3.File,
  ): Promise<IndiSignUpResDto> {
    // if (profileImage) {
    //   indiSignUpReqDto.profile_image = profileImage.location;
    // }
    const { id, accessToken, refreshToken } =
      await this.authService.IndisignUp(indiSignUpReqDto);
    return { id, accessToken, refreshToken };
  }

  // 2. 회원가입 (사업자회원)
  // POST : localhost:3000/auth/signup2
  @Post('signup2')
  @Public()
  // @UseInterceptors(FileInterceptor('profile_image', multerOptions))
  @ApiOperation({ summary: '회원가입 (사업자회원)' })
  @ApiBody({ type: CorpSignUpReqDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: CorpSignUpResDto,
  })
  async CorpsignUp(
    @Body() corpSignUpReqDto: CorpSignUpReqDto,
    // @UploadedFile() profileImage: Express.MulterS3.File,
  ): Promise<CorpSignUpResDto> {
    // if (profileImage) {
    //   corpSignUpReqDto.profile_image = profileImage.location;
    // }
    const { id, accessToken, refreshToken } =
      await this.authService.CorpsignUp(corpSignUpReqDto);
    return { id, accessToken, refreshToken };
  }

  // 3. 로그인 (Email, Password)
  // POST : localhost:3000/auth/signin
  @Post('signin')
  @Public()
  @ApiOperation({ summary: 'Email, Password 로그인' })
  @ApiBody({ type: SignInReqDto })
  @ApiResponse({ status: 200, description: '로그인 성공', type: SigninResDto })
  async signIn(@Body() signInReqDto: SignInReqDto, @Req() request: Request) {
    return this.authService.signIn(signInReqDto, request);
  }

  // 4. 로그인 (API-Key)
  // POST : localhost:3000/auth/signin/api-key
  @Post('signin/api-key')
  @Public()
  @ApiOperation({ summary: 'API-Key 로그인' })
  @ApiBody({ type: ApiKeySignInReqDto })
  @ApiResponse({ status: 200, description: '로그인 성공', type: SigninResDto })
  async signInByApiKey(
    @Body() apiKeySignInReqDto: ApiKeySignInReqDto,
    @Req() request: Request,
  ) {
    return this.authService.signInByApiKey(apiKeySignInReqDto, request);
  }

  // 5. 리프레시토큰 발급 (개인회원/사업자회원/관리자회원)
  // POST : localhost:3000/auth/refresh
  @Post('refresh')
  @ApiOperation({ summary: '리프레시토큰 자동 발급' })
  @ApiBody({ type: RefreshResDto })
  @ApiResponse({
    status: 200,
    description: '토큰 발급 성공',
    type: RefreshResDto,
  })
  async refresh(
    @Headers('authorization') authorization: string,
    @User() user: UserAfterAuth,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Bearer token is missing');
    }

    const { accessToken, refreshToken } = await this.authService.refresh(
      token,
      user.id,
    );
    return { accessToken, refreshToken };
  }

  // 6. 로그아웃 (개인회원/사업자회원/관리자회원)
  // DELETE : localhost:3000/auth/signout
  @Delete('signout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async signOut(@User() user: UserAfterAuth) {
    return this.authService.signOut(user.id);
  }

  // 7. 비밀번호 재설정 (개인회원/사업자회원/관리자회원)
  // POST : localhost:3000/auth/reset-password
  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiBody({ type: ResetPasswordReqDto })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 성공',
    type: ResetPasswordResDto,
  })
  async resetPassword(
    @Body() resetPasswordReqDto: ResetPasswordReqDto,
  ): Promise<ResetPasswordResDto> {
    const { email, username } = resetPasswordReqDto;
    return this.authService.resetPassword(email, username);
  }
}

// 스웨거 상 인증을 거쳐야 함
// @ApiBearerAuth()
