import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OpenAccountDto {
	@ApiProperty({
		description: 'Email address of the user',
		example: 'example@gmail.com',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({
		description: 'Secret key for account activation',
		example: 'secret123',
	})
	@IsNotEmpty()
	@IsString()
	otp: string;

	@ApiProperty({
		description: 'password',
		example: 'P@ssw0rd!',
	})
	@IsString()
	@IsNotEmpty()
	password: string;

	@ApiProperty({
		description: 'name',
		example: 'john_doe',
	})
	@IsString()
	@IsOptional()
	name?: string;
}

export class RequestEmailDto {
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({
		example: 'example@gmail.com',
		description: 'email',
	})
	email: string;
}
