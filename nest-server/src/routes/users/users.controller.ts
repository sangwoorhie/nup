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
import { FindUserReqDto } from './dto/req.dto';
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

  // 유저 전체조회 (관리자만)
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

  // 단일유저 조회
  @Get(':id')
  @ApiGetResponse(FindUserResDto)
  findOne(@Param() { id }: FindUserReqDto) {
    // return this.usersService.findOne(id);
  }
}
