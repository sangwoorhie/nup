import { IsString, IsNotEmpty } from 'class-validator';

export class ReadFileDto {
  @IsString()
  @IsNotEmpty()
  pathType: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsString()
  @IsNotEmpty()
  encoding: string;
}
