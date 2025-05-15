import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
	@ApiProperty({
		example: 'example@gmail.com',
		description: 'อีเมลของผู้ใช้',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({ example: 'P@ssword1234', description: 'รหัสผ่านของผู้ใช้' })
	@IsString()
	@IsNotEmpty()
	password: string;
}
