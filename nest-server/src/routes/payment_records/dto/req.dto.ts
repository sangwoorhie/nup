import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChargeStatus } from 'src/enums/enums';

export class CreateChargeDto {
  @ApiProperty({ description: '충전 금액' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '입금자명' })
  @IsString()
  account_holder_name: string;
}

export class AdminChargeDto {
  @ApiProperty({ description: '충전 상태' })
  @IsEnum(ChargeStatus)
  status: ChargeStatus;
}
