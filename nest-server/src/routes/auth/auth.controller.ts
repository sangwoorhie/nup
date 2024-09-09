import { UsersService } from './../users/users.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
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
  VerifyAuthNumberDto,
  SendAuthNumberDto,
  ImageReqDto,
  BusinessLicenseReqDto,
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
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CheckEmailReqDto } from '../users/dto/req.dto';
import { multerOptions } from 'src/common/multer.options';
import { readFileSync } from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { UserType } from 'src/enums/enums';

@ApiTags('Auth')
@ApiExtraModels(
  IndiSignUpReqDto,
  CorpSignUpReqDto,
  SignInReqDto,
  IndiSignUpResDto,
  CorpSignUpResDto,
  SigninResDto,
  RefreshResDto,
)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // 1. 회원가입 (개인회원)
  // POST : localhost:3000/auth/signup1
  @Post('signup1')
  @Public()
  @UseInterceptors(FileInterceptor('profile_image', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '회원가입 (개인회원)' })
  @ApiBody({ type: IndiSignUpReqDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: IndiSignUpResDto,
  })
  async IndisignUp(
    @Body() indiSignUpReqDto: IndiSignUpReqDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ): Promise<IndiSignUpResDto> {
    const base64Image = readFileSync(profileImage.path).toString('base64');
    indiSignUpReqDto.profile_image = `data:${profileImage.mimetype};base64,${base64Image}`;
    const { id, accessToken, refreshToken } =
      await this.authService.IndisignUp(indiSignUpReqDto);
    return { id, accessToken, refreshToken };
  }

  // 2. 회원가입 (사업자회원)
  // POST : localhost:3000/auth/signup2
  @Post('signup2')
  @Public()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profile_image', maxCount: 1 },
        { name: 'business_license', maxCount: 1 },
      ],
      multerOptions,
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '회원가입 (사업자회원)' })
  @ApiBody({ type: CorpSignUpReqDto })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: CorpSignUpResDto,
  })
  async CorpsignUp(
    @Body() corpSignUpReqDto: CorpSignUpReqDto,
    @UploadedFiles()
    files: {
      profile_image?: Express.Multer.File[];
      business_license?: Express.Multer.File[];
    },
  ): Promise<CorpSignUpResDto> {
    const profileImage = files.profile_image?.[0];
    const businessLicense = files.business_license?.[0];
    if (profileImage) {
      const base64Image = readFileSync(profileImage.path).toString('base64');
      corpSignUpReqDto.profile_image = `data:${profileImage.mimetype};base64,${base64Image}`;
    }
    if (businessLicense) {
      const base64License = readFileSync(businessLicense.path).toString(
        'base64',
      );
      corpSignUpReqDto.business_license = `data:${businessLicense.mimetype};base64,${base64License}`;
    }
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
    return await this.authService.signIn(signInReqDto, request);
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
    return await this.authService.signInByApiKey(apiKeySignInReqDto, request);
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
    return { accessToken, refreshToken, user };
  }

  // 6. 로그아웃 (개인회원/사업자회원/관리자회원)
  // DELETE : localhost:3000/auth/signout
  @Delete('signout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async signOut(@User() user: UserAfterAuth) {
    return await this.authService.signOut(user.id);
  }

  // 7. 임시 비밀번호 발급 (개인회원/사업자회원/관리자회원)
  // POST : localhost:3000/auth/reset-password
  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: '임시 비밀번호 발급 이메일 전송' })
  @ApiBody({ type: ResetPasswordReqDto })
  @ApiResponse({
    status: 200,
    description: '임시 비밀번호 발급 이메일 전송 성공',
    type: ResetPasswordResDto,
  })
  async resetPassword(
    @Body() resetPasswordReqDto: ResetPasswordReqDto,
  ): Promise<ResetPasswordResDto> {
    const { email, username } = resetPasswordReqDto;
    return await this.authService.resetPassword(email, username);
  }

  // 8. E-mail 중복확인 (사용자)
  // GET : localhost:3000/auth/checkemail?email=powercom92@naver.com
  @Get('checkemail')
  @Public()
  @ApiOperation({ summary: 'E-mail 중복검사' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiQuery({ name: 'email', required: true })
  async emailCheck(@Query() checkEmailReqDto: CheckEmailReqDto) {
    const { email } = checkEmailReqDto;
    return await this.usersService.emailCheck(email);
  }

  // 9. 회원가입시 이메일로 인증번호 전송 (5분 시간제한)
  // POST : localhost:3000/auth/send-auth-number
  @Post('send-auth-number')
  @Public()
  @ApiOperation({ summary: '회원가입시 이메일로 인증번호 전송' })
  async sendAuthNumber(
    @Body() sendAuthNumberDto: SendAuthNumberDto,
  ): Promise<{ message: string }> {
    return await this.authService.sendAuthenticationNumber(
      sendAuthNumberDto.email,
    );
  }

  // 10. 회원가입시 이메일로 전송된 인증번호 확인 (5분 시간제한)
  // POST : localhost:3000/auth/verify-auth-number
  @Post('verify-auth-number')
  @Public()
  @ApiOperation({ summary: '회원가입시 이메일로 전송된 인증번호 확인' })
  async verifyAuthNumber(
    @Body() verifyAuthNumberDto: VerifyAuthNumberDto,
  ): Promise<{ message: string }> {
    return await this.authService.verifyAuthenticationNumber(
      verifyAuthNumberDto,
    );
  }

  // 11. 구글 소셜로그인
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @Public()
  async googleAuth(@Req() req: any) {
    // The Google OAuth flow will be triggered by this route
  }

  // 구글 소셜로그인 후 콜백 처리
  @Post('google/callback')
  @Public()
  async googleAuthCallback(
    @Body('credential') credential: string,
    @Res() res: Response,
  ) {
    try {
      // Verify the Google credential
      const googleUser =
        await this.authService.verifyGoogleCredential(credential);

      // Process the user in your system
      const { user, isNewUser, userType, accessToken, refreshToken } =
        await this.authService.googleLogin(googleUser);

      // If it's a new user, redirect to the signup page depending on user type
      if (isNewUser) {
        return res.json({
          isNewUser: true,
          userId: user.id,
          userType: userType,
        });
      } else {
        // If the user is already registered, just return tokens
        return res.json({
          id: user.id,
          accessToken,
          refreshToken,
          email: user.email,
          userType: user.user_type,
        });
      }
    } catch (error) {
      console.error('Error in googleAuthCallback:', error);
      return res.status(400).json({ message: 'Google authentication failed.' });
    }
  }

  // 12. 구글 소셜로그인 - 개인 회원가입
  @Post('signup1/:userId')
  @Public()
  async completeIndiSignUp(
    @Param('userId') userId: string,
    @Body() indiSignUpReqDto: IndiSignUpReqDto,
  ) {
    // 기존 사용자의 추가 정보 업데이트
    await this.authService.completeIndiSignUp(userId, indiSignUpReqDto);
    return { message: '개인 회원가입이 완료되었습니다.' };
  }

  // 13. 구글 소셜로그인 - 사업자 회원가입
  @Post('signup2/:userId')
  @Public()
  async completeCorpSignUp(
    @Param('userId') userId: string,
    @Body() corpSignUpReqDto: CorpSignUpReqDto,
  ) {
    // 기존 사용자의 추가 정보 업데이트
    await this.authService.completeCorpSignUp(userId, corpSignUpReqDto);
    return { message: '사업자 회원가입이 완료되었습니다.' };
  }
}

// 이미지 업로드
// POST : localhost:3000/auth/upload-single
// @Post('upload-single')
// @Public()
// @UseInterceptors(FileInterceptor('profile_image'))
// uploadFile(@UploadedFile() profile_image: Express.Multer.File) {
//   console.log(profile_image);
// }

// 스웨거 상 인증을 거쳐야 함
// @ApiBearerAuth()
