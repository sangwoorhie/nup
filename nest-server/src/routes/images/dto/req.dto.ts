import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString, IsUUID } from 'class-validator';

export class DownloadImagesReqDto {
  @ApiProperty({ description: '이미지 ID 목록', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  readonly ids: string[];
}

export class ViewImagesReqDto {
  @ApiProperty({ description: '이미지 ID 목록', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  readonly ids: string[];
}

export class DeleteImagesReqDto {
  @ApiProperty({ description: '이미지 ID 목록', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  readonly ids: string[];
}

export class DetectImagesReqDto {
  @ApiProperty({ description: '이미지 ID 목록', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  readonly ids: string[];
}

export class ModifyCostReqDto {
  @ApiProperty({ description: '배율' })
  @IsNumber()
  dividingNumber: number;

  @ApiProperty({ description: '삭감액' })
  @IsNumber()
  cuttingOffValue: number;
}
