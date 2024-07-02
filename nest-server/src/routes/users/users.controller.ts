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
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import {
  ChangePasswordReqDto,
  DeleteUserReqDto,
  FindUserReqDto,
  UpdateCorpUserReqDto,
  UpdateIndiUserReqDto,
} from './dto/req.dto';
import { PageReqDto } from 'src/common/dto/req.dto';
import {
  ApiGetItemsResponse,
  ApiGetResponse,
} from 'src/decorators/swagger.decorators';
import { FindUserResDto } from './dto/res.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';

@ApiTags('User')
@ApiExtraModels(FindUserResDto) // DTO들 입력
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. 개인회원 정보 조회 GET : localhost:3000/users/me/indi
  @Get('me/indi')
  async getMyIndiInfo(@User() user: UserAfterAuth) {
    return await this.usersService.findIndiUserInfo(user.id);
  }

  // 2. 사업자회원 정보 조회 GET : localhost:3000/users/me/corp
  @Get('me/corp')
  async getMyCorpInfo(@User() user: UserAfterAuth) {
    return await this.usersService.findCorpUserInfo(user.id);
  }

  // 3. 개인회원 정보 수정 PATCH : localhost:3000/users/me/indi
  @Patch('me/indi')
  async updateMyIndiInfo(
    @User() user: UserAfterAuth,
    @Body() updateIndiUserReqDto: UpdateIndiUserReqDto,
  ) {
    return await this.usersService.updateIndiUserInfo(
      user.id,
      updateIndiUserReqDto,
    );
  }

  // 4. 사업자회원 정보 수정  PATCH : localhost:3000/users/me/corp
  @Patch('me/corp')
  async updateMyCorpInfo(
    @User() user: UserAfterAuth,
    @Body() updateCorpUserReqDto: UpdateCorpUserReqDto,
  ) {
    return await this.usersService.updateCorpUserInfo(
      user.id,
      updateCorpUserReqDto,
    );
  }

  // 5. 비밀번호 변경 PATCH : localhost:3000/users/me/password
  @Patch('me/password')
  async changePassword(
    @User() user: UserAfterAuth,
    @Body() changePasswordReqDto: ChangePasswordReqDto,
  ) {
    return await this.usersService.changePassword(
      user.id,
      changePasswordReqDto,
    );
  }

  // 6. 회원 탈퇴 DELETE : localhost:3000/users/me
  @Delete('me')
  async deleteUser(
    @User() user: UserAfterAuth,
    @Body() deleteUserReqDto: DeleteUserReqDto,
  ) {
    return await this.usersService.deleteUser(user.id, deleteUserReqDto);
  }

  // 7. 유저 전체조회 (관리자만)
  @Get()
  @ApiGetItemsResponse(FindUserResDto)
  @Usertype(UserType.ADMIN)
  // @UseGuards(JwtAuthGuard)
  async findAll(
    @Query() { page, size }: PageReqDto,
  ): Promise<FindUserResDto[]> {
    const users = await this.usersService.findAll(page, size);
    return users.map(({ id, email, created_at }) => {
      return { id, email, created_at: created_at };
    });
  }

  // 8. 단일유저 조회
  @Get(':id')
  @ApiGetResponse(FindUserResDto)
  findOne(@Param() { id }: FindUserReqDto) {
    // return this.usersService.findOne(id);
  }
}

// Admin만 가능 :   @Usertype(UserType.ADMIN)
// 로그인상태없이 가능 :  @Public()
