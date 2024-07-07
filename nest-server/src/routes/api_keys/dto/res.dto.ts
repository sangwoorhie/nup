import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsEmail, IsIP, IsNumber, IsString } from "class-validator";

// 사용자의 입장
export class FindApikeyResDto {
    @ApiProperty({ description: 'API-Key' })
    @IsString()
    readonly apikey: string;

    @ApiProperty({
        description: '사용자의 IP주소들',
        type: [String],
        example: '192.168.1.1,192.168.1.2',
        })
    @IsArray()
    @IsIP(undefined, { each: true })
    readonly ips: string[];

    @ApiProperty({ description: '오늘 Token 사용량' })
    @IsNumber()
    readonly today_usage: number;

    @ApiProperty({ description: '전체 Token 사용량' })
    @IsNumber()
    readonly total_usage: number;

    @ApiProperty({ description: 'API-Key 생성일' })
    @IsDate()
    readonly created_at: Date;
}

// 관리자의 입장
export class FindApikeyAdminResDto {
    @ApiProperty({ description: 'API-Key' })
    @IsString()
    readonly api_key: string;

    @ApiProperty({
        description: '사용자의 IP주소들',
        type: [String],
        example: '192.168.1.1,192.168.1.2',
        })
    @IsArray()
    @IsIP(undefined, { each: true })
    readonly ips: string[];

    @ApiProperty({ description: '오늘 Token 사용량' })
    @IsNumber()
    readonly today_usage: number;

    @ApiProperty({ description: '전체 Token 사용량' })
    @IsNumber()
    readonly total_usage: number;

    @ApiProperty({ description: 'API-Key 생성일' })
    @IsDate()
    readonly created_at: Date;

    @ApiProperty({ description: '사용자 이름, 또는 기업명' })
    @IsString()
    readonly username: string;

    @ApiProperty({ description: '사용자 E-mail' })
    @IsEmail()
    readonly email: string;
}