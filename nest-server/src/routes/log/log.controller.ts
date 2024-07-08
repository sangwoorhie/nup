import { Controller, Get, Query } from '@nestjs/common';
import { LogService } from './log.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiGetResponse } from 'src/decorators/swagger.decorators';
import { LogResDto } from './dto/res.dto';
import { Usertype } from 'src/decorators/usertype.decorators';
import { UserType } from 'src/enums/enums';
import { PageReqDto } from 'src/common/dto/req.dto';
import { PageResDto } from 'src/common/dto/res.dto';

@ApiTags('Log')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  // 1. 모든 로그 조회 (관리자)
  // GET : localhost:3000/log?page=1&size=20
  @Get()
  @ApiOperation({ summary: '사용자의 모든 로그 조회 (관리자)' })
  @ApiGetResponse(LogResDto)
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @Usertype(UserType.ADMIN)
  async findAllLogs(
    @Query() { page, size }: PageReqDto,
  ): Promise<PageResDto<LogResDto>> {
    return this.logService.findAllLogs(page, size);
  }
}
