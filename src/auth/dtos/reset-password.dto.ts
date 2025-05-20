import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({
		example: 'example@gmail.com',
		type: String,
	})
	email: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		example: '1234567890',
		type: String,
	})
	otp: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		example: 'P@ssword1234',
		type: String,
	})
	password: string;
}
