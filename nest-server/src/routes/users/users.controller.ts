import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
import { PageReqDto } from 'src/common/dto/req.dto';
import {
  ApiGetItemsResponse,
  ApiGetResponse,
} from 'src/decorators/swagger.decorators';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { PageResDto } from 'src/common/dto/res.dto';
import { FindCorpUserResDto, FindIndiUserResDto } from './dto/res.dto';

@ApiTags('User')
@ApiExtraModels(
  FindIndiUserReqDto,
  FindCorpUserReqDto,
  UpdateIndiUserReqDto,
  UpdateCorpUserReqDto,
  ChangePasswordReqDto,
  DeleteUserReqDto,
  BanUserReqDto,
  UpdatePointsReqDto,
  FindIndiUserResDto,
  FindCorpUserResDto,
) // DTO들 입력
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. 본인정보 조회 (개인회원)
  // GET : localhost:3000/users/me/indi
  @Get('me/indi')
  @ApiOperation({ summary: '본인 정보 조회 (개인회원)' })
  @ApiResponse({ status: 200, description: '성공', type: FindIndiUserResDto })
  async getMyIndiInfo(@User() user: UserAfterAuth) {
    return await this.usersService.findIndiUserInfo(user.id);
  }

  // 2. 본인정보 조회 (사업자회원)
  // GET : localhost:3000/users/me/corp
  @Get('me/corp')
  @ApiOperation({ summary: '본인 정보 조회 (사업자회원)' })
  @ApiResponse({ status: 200, description: '성공', type: FindCorpUserResDto })
  async getMyCorpInfo(@User() user: UserAfterAuth) {
    return await this.usersService.findCorpUserInfo(user.id);
  }

  // 3. 본인정보 수정 (개인회원)
  // PATCH : localhost:3000/users/me/indi
  @Patch('me/indi')
  @ApiOperation({ summary: '본인 정보 수정 (개인회원)' })
  @ApiBody({ type: UpdateIndiUserReqDto })
  @ApiResponse({ status: 200, description: '성공', type: FindIndiUserResDto })
  async updateMyIndiInfo(
    @User() user: UserAfterAuth,
    @Body() updateIndiUserReqDto: UpdateIndiUserReqDto,
  ) {
    return await this.usersService.updateIndiUserInfo(
      user.id,
      updateIndiUserReqDto,
    );
  }

  // 4. 본인정보 수정 (사업자회원)
  // PATCH : localhost:3000/users/me/corp
  @Patch('me/corp')
  @ApiOperation({ summary: '본인 정보 수정 (사업자회원)' })
  @ApiBody({ type: UpdateCorpUserReqDto })
  @ApiResponse({ status: 200, description: '성공', type: FindCorpUserResDto })
  async updateMyCorpInfo(
    @User() user: UserAfterAuth,
    @Body() updateCorpUserReqDto: UpdateCorpUserReqDto,
  ) {
    return await this.usersService.updateCorpUserInfo(
      user.id,
      updateCorpUserReqDto,
    );
  }

  // 5. 비밀번호 변경 (개인회원/사업자회원/관리자회원)
  //  PATCH : localhost:3000/users/me/password
  @Patch('me/password')
  @ApiOperation({ summary: '비밀번호 변경 (개인회원/사업자회원/관리자회원)' })
  @ApiBody({ type: ChangePasswordReqDto })
  @ApiResponse({ status: 200, description: '비밀번호가 변경되었습니다.' })
  async changePassword(
    @User() user: UserAfterAuth,
    @Body() changePasswordReqDto: ChangePasswordReqDto,
  ) {
    return await this.usersService.changePassword(
      user.id,
      changePasswordReqDto,
    );
  }

  // 6. 회원 탈퇴 (개인회원/사업자회원/관리자회원)
  //  DELETE : localhost:3000/users/me
  @Delete('me')
  @ApiOperation({ summary: '회원 탈퇴 (개인회원/사업자회원/관리자회원)' })
  @ApiBody({ type: DeleteUserReqDto })
  @ApiResponse({ status: 200, description: '회원 탈퇴되었습니다.' })
  async deleteUser(
    @User() user: UserAfterAuth,
    @Body() deleteUserReqDto: DeleteUserReqDto,
  ) {
    return await this.usersService.deleteUser(user.id, deleteUserReqDto);
  }

  // 7. 개인회원 전체조회 (관리자)
  // GET localhost:3000/users/admin/indi?page=1&size=20
  @Get('admin/indi')
  @ApiOperation({ summary: '개인회원 전체조회 (관리자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetItemsResponse(FindIndiUserResDto)
  @Usertype(UserType.ADMIN)
  async findAll(
    @Query() { page, size }: PageReqDto,
  ): Promise<PageResDto<FindIndiUserResDto>> {
    return await this.usersService.findAll(page, size);
  }

  // 8. 개인회원 단일조회 (관리자)
  // GET : localhost:3000/users/admin/indi/find?page=1&size=20&criteria=email&email=a26484638@komapper.com
  // GET : localhost:3000/users/admin/indi/find?page=1&size=20&criteria=username&username=Jake
  @Get('admin/indi/find')
  @ApiOperation({ summary: '개인회원 단일조회 (관리자)' })
  @ApiQuery({ name: 'criteria', enum: ['email', 'username'], required: true })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetResponse(FindIndiUserResDto)
  @Usertype(UserType.ADMIN)
  async findIndiUser(
    @Query() { page, size }: PageReqDto,
    @Query('criteria') criteria: 'email' | 'username',
    @Query('email') email?: string,
    @Query('username') username?: string,
  ) {
    const findIndiUserReqDto = new FindIndiUserReqDto();
    findIndiUserReqDto.criteria = criteria;
    findIndiUserReqDto.email = email;
    findIndiUserReqDto.username = username;

    return await this.usersService.findIndiUser(findIndiUserReqDto, page, size);
  }

  // 9. 사업자회원 전체조회 (관리자)
  //  GET : localhost:3000/users/admin/corp?page=1&size=20
  @Get('admin/corp')
  @ApiOperation({ summary: '사업자회원 전체조회 (관리자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetItemsResponse(FindCorpUserResDto)
  @Usertype(UserType.ADMIN)
  async findAllCorporateUsers(
    @Query() { page, size }: PageReqDto,
  ): Promise<PageResDto<FindCorpUserResDto>> {
    return await this.usersService.findAllCorporateUsers(page, size);
  }

  // 10. 사업자회원 단일조회 (관리자)
  // GET : localhost:3000/users/admin/corp/find?page=1&size=20&criteria=corporate_name&corporate_name=string
  // GET : localhost:3000/users/admin/corp/find?page=1&size=20&criteria=business_registration_number&business_registration_number=1234
  @Get('admin/corp/find')
  @ApiOperation({ summary: '사업자회원 단일조회 (관리자)' })
  @ApiQuery({
    name: 'criteria',
    enum: ['corporate_name', 'business_registration_number'],
    required: true,
  })
  @ApiQuery({ name: 'corporate_name', required: false })
  @ApiQuery({ name: 'business_registration_number', required: false })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetResponse(FindCorpUserResDto)
  @Usertype(UserType.ADMIN)
  async findCorporateUser(
    @Query() { page, size }: PageReqDto,
    @Query('criteria')
    criteria: 'corporate_name' | 'business_registration_number',
    @Query('corporate_name') corporate_name?: string,
    @Query('business_registration_number')
    business_registration_number?: number,
  ) {
    const findCorpUserReqDto = new FindCorpUserReqDto();
    findCorpUserReqDto.criteria = criteria;
    findCorpUserReqDto.corporate_name = corporate_name;
    findCorpUserReqDto.business_registration_number =
      business_registration_number;

    return await this.usersService.findCorporateUser(
      findCorpUserReqDto,
      page,
      size,
    );
  }

  // 11. 회원 계정정지 (관리자)
  // PATCH localhost:3000/users/admin/ban?userId=12345
  @Patch('admin/ban')
  @ApiOperation({ summary: '회원 계정정지 (관리자)' })
  @ApiQuery({ name: 'userId', required: true, description: '유저 ID' })
  @ApiBody({ type: BanUserReqDto })
  @ApiResponse({ status: 200, description: '계정이 정지되었습니다.' })
  @Usertype(UserType.ADMIN)
  async banUser(
    @Query('userId') userId: string,
    @Body() banUserReqDto: BanUserReqDto,
  ) {
    return await this.usersService.banUser(userId, banUserReqDto);
  }

  // 12. 회원 계정정치 취소 (관리자)
  // PATCH localhost:3000/users/admin/unban?userId=12345
  @Patch('admin/unban')
  @ApiOperation({ summary: '회원 계정정지 취소 (관리자)' })
  @ApiQuery({ name: 'userId', required: true, description: '유저 ID' })
  @ApiResponse({ status: 200, description: '계정 정지가 해제되었습니다.' })
  @Usertype(UserType.ADMIN)
  async unbanUser(@Query('userId') userId: string) {
    return await this.usersService.unbanUser(userId);
  }

  // 13. 관리자회원으로 변경 (관리자)
  // PATCH : localhost:3000/users/admin/promote?userId=12345
  @Patch('admin/promote')
  @ApiOperation({ summary: '관리자회원으로 변경 (관리자)' })
  @ApiQuery({ name: 'userId', required: true, description: '유저 ID' })
  @ApiResponse({
    status: 200,
    description: '회원이 관리자 계정으로 변경되었습니다.',
  })
  @Usertype(UserType.ADMIN)
  async promoteUser(@Query('userId') userId: string) {
    return await this.usersService.promoteUser(userId);
  }

  // 14. 사업자등록증 확인처리 (관리자)
  // PATCH : localhost:3000/users/admin/corp/verify?corporateId=12345
  @Patch('admin/corp/verify')
  @ApiOperation({ summary: '사업자등록증 확인처리 (관리자)' })
  @ApiQuery({ name: 'corporateId', required: true, description: '기업 ID' })
  @ApiResponse({
    status: 200,
    description: '사업자등록증이 확인처리 되었습니다.',
  })
  @Usertype(UserType.ADMIN)
  async verifyBusinessLicense(@Query('corporateId') corporateId: string) {
    return await this.usersService.verifyBusinessLicense(corporateId);
  }

  // 15. 포인트 충전/차감 (관리자)
  // PATCH : localhost:3000/users/admin/points?userId=12345
  @Patch('admin/points')
  @ApiQuery({ name: 'userId', required: true, description: '유저 ID' })
  @ApiBody({ type: UpdatePointsReqDto })
  @ApiResponse({ status: 200, description: '포인트가 업데이트되었습니다.' })
  @Usertype(UserType.ADMIN)
  async updatePoints(
    @Query('userId') userId: string,
    @Body() updatePointsReqDto: UpdatePointsReqDto,
  ) {
    return await this.usersService.updatePoints(userId, updatePointsReqDto);
  }
}

// Admin만 가능 :   @Usertype(UserType.ADMIN)
// 로그인상태없이 가능 :  @Public()
