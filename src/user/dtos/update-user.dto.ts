import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsString,
	IsEmail,
	IsOptional,
	IsNumber,
	Matches,
} from 'class-validator';

export class UpdateUserDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional({
		example: 'john_doe',
		description: 'name',
		type: String,
	})
	name?: string;

	@IsEmail()
	@IsOptional()
	@ApiPropertyOptional({
		example: 'example@gmail.com',
		description: 'Email',
		type: String,
	})
	email?: string;

	@IsNumber()
	@IsOptional()
	@ApiPropertyOptional({
		example: 100,
		description: 'User score',
		type: Number,
	})
	score?: number;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		example: 'P@ssword1234',
		description: 'Password',
		type: String,
	})
	password?: string;

	@IsOptional()
	@Matches(/^\d{8}$/, { message: 'student id should be 8-digit number ' })
	@ApiPropertyOptional({
		example: '67011501',
		description: 'student id',
		type: String,
	})
	studentId?: string;
}
