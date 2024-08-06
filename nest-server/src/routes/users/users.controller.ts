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
  StreamableFile,
  Header,
  UnauthorizedException,
  NotFoundException,
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
  ChargeAmountReqDto,
  CheckPasswordReqDto,
  DeleteUserReqDto,
  FindAdminUserReqDto,
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
import {
  FindAdminUserResDto,
  FindCorpUserResDto,
  FindIndiUserResDto,
} from './dto/res.dto';
import { sortAndDeduplicateDiagnostics } from 'typescript';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Public } from 'src/decorators/public.decorators';

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
  @ApiOperation({ summary: '비밀번호 변경' })
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
  @ApiOperation({ summary: '회원 탈퇴' })
  // @ApiBody({ type: DeleteUserReqDto })
  @ApiResponse({ status: 200, description: '회원 탈퇴되었습니다.' })
  async deleteUser(
    @User() user: UserAfterAuth,
    // @Body() deleteUserReqDto: DeleteUserReqDto,
  ) {
    return await this.usersService.deleteUser(user.id);
  }

  // 7. 개인회원 전체목록 조회 (관리자)
  // GET localhost:3000/users/admin/indi?page=1&size=20
  @Get('admin/indi')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '개인회원 전체목록 조회 (관리자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetItemsResponse(FindIndiUserResDto)
  async findAll(
    @Query() { page, size }: PageReqDto,
  ): Promise<PageResDto<FindIndiUserResDto>> {
    return await this.usersService.findAll(page, size);
  }

  // 8. 개인회원 단일조회 - email조회 또는 회원이름조회 (관리자)
  // GET : localhost:3000/users/admin/indi/find?page=1&size=20&criteria=email&email=a26484638@komapper.com
  // GET : localhost:3000/users/admin/indi/find?page=1&size=20&criteria=username&username=Jake
  @Get('admin/indi/find')
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary:
      '개인회원 단일조회 (email 또는 회원이름으로 필터 후 검색조회) (관리자)',
  })
  @ApiQuery({
    name: 'criteria',
    enum: ['email', 'username'],
    required: true,
    description: 'email로 조회할것인지 username으로 조회할것인지 선택',
  })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetResponse(FindIndiUserResDto)
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

  // 9. 사업자회원 전체목록 조회 (관리자)
  //  GET : localhost:3000/users/admin/corp?page=1&size=20
  @Get('admin/corp')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '사업자회원 전체목록 조회 (관리자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetItemsResponse(FindCorpUserResDto)
  async findAllCorporateUsers(
    @Query() { page, size }: PageReqDto,
  ): Promise<PageResDto<FindCorpUserResDto>> {
    return await this.usersService.findAllCorporateUsers(page, size);
  }

  // 10. 사업자회원 단일조회 - 기업명조회 또는 사업자등록번호조회 (관리자)
  // GET : localhost:3000/users/admin/corp/find?page=1&size=20&criteria=corporate_name&corporate_name=string
  // GET : localhost:3000/users/admin/corp/find?page=1&size=20&criteria=business_registration_number&business_registration_number=1234
  @Get('admin/corp/find')
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary: '사업자회원 단일조회 (기업명 or 사업자등록번호 필터조회) (관리자)',
  })
  @ApiQuery({
    name: 'criteria',
    enum: ['corporate_name', 'business_registration_number'],
    required: true,
    description:
      'corporate_name로 조회할것인지 business_registration_number으로 조회할것인지 선택',
  })
  @ApiQuery({ name: 'corporate_name', required: false })
  @ApiQuery({ name: 'business_registration_number', required: false })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetResponse(FindCorpUserResDto)
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

  // 11. 관리자 회원 전체목록 조회 (관리자)
  // GET : localhost:3000/users/admin?page=1&size=20
  @Get('admin')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '관리자 전체목록 조회 (관리자)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetResponse(FindAdminUserResDto)
  async findAllAdmins(
    @Query() { page, size }: PageReqDto,
  ): Promise<PageResDto<FindAdminUserResDto>> {
    return await this.usersService.findAllAdmins(page, size);
  }

  // 12. 관리자 회원 단일조회 (관리자)
  // GET : localhost:3000/users/admin/find?criteria=email&email=admin@example.com
  // GET : localhost:3000/users/admin/find?criteria=username&username=admin
  @Get('admin/find')
  @Usertype(UserType.ADMIN)
  @ApiOperation({
    summary:
      '관리자 단일조회 (email 또는 회원이름으로 필터 후 검색조회) (관리자)',
  })
  @ApiQuery({
    name: 'criteria',
    enum: ['email', 'username'],
    required: true,
    description: 'email로 조회할것인지 username으로 조회할것인지 선택',
  })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiGetResponse(FindAdminUserResDto)
  async findAdminUser(
    @Query() { page, size }: PageReqDto,
    @Query('criteria') criteria: 'email' | 'username',
    @Query('email') email?: string,
    @Query('username') username?: string,
  ) {
    const findAdminUserReqDto = new FindAdminUserReqDto();
    findAdminUserReqDto.criteria = criteria;
    findAdminUserReqDto.email = email;
    findAdminUserReqDto.username = username;

    return await this.usersService.findAdminUser(
      findAdminUserReqDto,
      page,
      size,
    );
  }

  // 13. 회원 계정정지 (관리자)
  // PATCH localhost:3000/users/admin/ban?userId=12345
  @Patch('admin/ban')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '회원 계정정지 (관리자)' })
  @ApiQuery({ name: 'userId', required: true, description: '유저 ID' })
  @ApiBody({ type: BanUserReqDto })
  @ApiResponse({ status: 200, description: '계정이 정지되었습니다.' })
  async banUser(
    @Query('userId') userId: string,
    @Body() banUserReqDto: BanUserReqDto,
  ) {
    return await this.usersService.banUser(userId, banUserReqDto);
  }

  // 14. 회원 계정정치 취소 (관리자)
  // PATCH localhost:3000/users/admin/unban?userId=12345
  @Patch('admin/unban')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '회원 계정정지 취소 (관리자)' })
  @ApiQuery({ name: 'userId', required: true, description: '유저 ID' })
  @ApiResponse({ status: 200, description: '계정 정지가 해제되었습니다.' })
  async unbanUser(@Query('userId') userId: string) {
    return await this.usersService.unbanUser(userId);
  }

  // 15. 관리자회원으로 변경 (관리자)
  // PATCH : localhost:3000/users/admin/promote?userId=12345
  @Patch('admin/promote')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '관리자회원으로 변경 (관리자)' })
  @ApiQuery({ name: 'userId', required: true, description: '유저 ID' })
  @ApiResponse({
    status: 200,
    description: '회원이 관리자 계정으로 변경되었습니다.',
  })
  async promoteUser(@Query('userId') userId: string) {
    return await this.usersService.promoteUser(userId);
  }

  // 16. 미확인 사업자등록증 확인처리 (관리자)
  // PATCH : localhost:3000/users/admin/corp/verify?corporateId=12345
  @Patch('admin/corp/verify')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '미확인 사업자등록증 확인처리 (관리자)' })
  @ApiQuery({ name: 'corporateId', required: true, description: '기업 ID' })
  @ApiResponse({
    status: 200,
    description: '사업자등록증이 확인처리 되었습니다.',
  })
  async verifyBusinessLicense(@Query('corporateId') corporateId: string) {
    return await this.usersService.verifyBusinessLicense(corporateId);
  }

  // 17. 포인트 충전/차감 (관리자)
  // PATCH : localhost:3000/users/admin/points?userId=12345
  @Patch('admin/points')
  @Usertype(UserType.ADMIN)
  @ApiOperation({ summary: '포인트 충전/차감 (관리자)' })
  @ApiQuery({ name: 'userId', required: true, description: '유저 ID' })
  @ApiBody({ type: UpdatePointsReqDto })
  @ApiResponse({ status: 200, description: '포인트가 업데이트되었습니다.' })
  async updatePoints(
    @Query('userId') userId: string,
    @Body() updatePointsReqDto: UpdatePointsReqDto,
  ) {
    return await this.usersService.updatePoints(userId, updatePointsReqDto);
  }

  // 18. 정보 수정, 삭제 시 비밀번호로 본인 일치 조회 (사용자, 관리자)
  // POST : localhost:3000/users/me/doublecheckpassword
  @Post('me/doublecheckpassword')
  @ApiOperation({ summary: '정보 수정, 삭제 시 비밀번호로 본인 일치 조회' })
  @ApiBody({ type: CheckPasswordReqDto })
  @ApiResponse({ status: 200, description: '본인임이 확인되었습니다.' })
  async doubleCheckPassword(
    @Body() checkPasswordReqDto: CheckPasswordReqDto,
    @User() user: UserAfterAuth,
  ) {
    const { password } = checkPasswordReqDto;
    return await this.usersService.doubleCheckPassword(user.id, password);
  }

  // 19. 사업자등록증 다운로드 (사용자, 관리자)
  // GET localhost:3000/users/download?userId=12345
  @Get('download')
  @Header('Content-Type', 'application/octet-stream')
  @Header('Content-Disposition', 'attachment; filename="business_license"')
  @ApiOperation({ summary: '사업자등록증 다운로드' })
  @ApiQuery({ name: 'userId', required: true, description: '유저 ID' })
  @ApiResponse({
    status: 200,
    description: '사업자등록증이 다운로드 되었습니다.',
  })
  async downloadBusinessLicense(
    @Query('userId') userId: string,
    @User() user: UserAfterAuth,
  ): Promise<StreamableFile> {
    // Check if the requested user ID matches the authenticated user ID or if the user is an admin
    if (
      user.id !== userId &&
      !(await this.usersService.checkUserIsAdmin(user.id))
    ) {
      throw new UnauthorizedException('권한이 없습니다.');
    }

    const businessLicensePath =
      await this.usersService.getBusinessLicensePath(userId);
    console.log('businessLicensePath', businessLicensePath);
    if (!businessLicensePath) {
      throw new NotFoundException('사업자등록증을 찾을 수 없습니다.');
    }

    const file = createReadStream(businessLicensePath);
    return new StreamableFile(file);
  }
}

// Admin만 가능 :   @Usertype(UserType.ADMIN)
// 로그인상태없이 가능 :  @Public()
