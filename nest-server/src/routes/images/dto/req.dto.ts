import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID } from 'class-validator';

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
