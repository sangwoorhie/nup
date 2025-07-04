import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

// 페이지네이션 응답 DTO
export class PageResDto<TData> {
  @ApiProperty({ required: true })
  @IsInt()
  readonly page?: number;

  @ApiProperty({ required: true })
  @IsInt()
  readonly size?: number;

  @ApiProperty({ required: true })
  @IsInt()
  readonly total: number;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  readonly items: TData[];
}
