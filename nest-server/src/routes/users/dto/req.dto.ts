import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

// 단일유저 조회 요청 DTO
export class FindUserReqDto {
  @ApiProperty({ required: true, description: '유저 아이디' })
  @IsUUID()
  readonly id: string;
}
