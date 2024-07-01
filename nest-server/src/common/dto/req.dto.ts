import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt } from 'class-validator';

// 페이지네이션 요청 DTO
export class PageReqDto {
  @ApiPropertyOptional({ description: '페이지. default = 1' })
  @Transform((param) => Number(param.value))
  @IsInt()
  readonly page?: number = 1;

  @ApiPropertyOptional({ description: '페이지 당 데이터 갯수. default = 20' })
  @Transform((param) => Number(param.value))
  @IsInt()
  readonly size?: number = 20;
}
