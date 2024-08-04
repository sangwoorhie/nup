import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsDate } from 'class-validator';
import { ImageStatus } from 'src/enums/enums';
import { Image } from 'src/entities/image.entity';

export class ImageResDto {
  @ApiProperty({ description: '이미지 ID' })
  @IsString()
  readonly id: string;

  @ApiProperty({ description: '이미지 경로' })
  @IsString()
  readonly image_path: string;

  @ApiProperty({ description: '이미지 분석상태' })
  @IsEnum(ImageStatus)
  readonly status: ImageStatus;

  @ApiProperty({ description: '분석완료 여부' })
  @IsBoolean()
  readonly is_detected: boolean;

  @ApiProperty({ description: '이미지가 업로드(생성) 된 시각' })
  @IsDate()
  readonly created_at: Date;

  @ApiProperty({ description: '이미지가 분석된 시각' })
  @IsDate()
  readonly detected_at: Date;

  constructor(image: Image) {
    this.id = image.id;
    this.image_path = image.image_path;
    this.status = image.status;
    this.is_detected = image.is_detected;
    this.created_at = image.created_at;
    this.detected_at = image.detected_at;
  }
}
