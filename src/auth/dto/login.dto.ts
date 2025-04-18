import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'อีเมลของผู้ใช้' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'รหัสผ่านของผู้ใช้' })
  @IsString()
  password: string;
}

