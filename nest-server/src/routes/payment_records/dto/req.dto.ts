import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChargeStatus } from 'src/enums/enums';

// 사용자의 현금 충전 요청
export class CreateChargeReqDto {
  @ApiProperty({ description: '충전 금액' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '입금자명' })
  @IsString()
  account_holder_name: string;
}

// 관리자의 상태 변경
export class AdminChargeDto {
  @ApiProperty({ description: '충전 상태' })
  @IsEnum(ChargeStatus)
  status: ChargeStatus;
}
