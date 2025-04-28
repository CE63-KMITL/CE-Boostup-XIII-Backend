import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
} from 'class-validator';
import { House } from 'src/shared/enum/house.enum';
import { Role } from 'src/shared/enum/role.enum';

export class CreateUserDto {
	@IsString()
	@IsOptional()
	@ApiPropertyOptional({
		example: 'john_doe',
		description: 'name',
		type: String,
	})
	name?: string;

	@IsEmail()
	@IsNotEmpty()
	@ApiPropertyOptional({
		example: 'example@gmail.com',
		description: 'Email',
		type: String,
	})
	email: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		example: 'P@ssword1234',
		description: 'Password',
		type: String,
	})
	password?: string;

	@IsOptional()
	@IsEnum(House, {
		message: `House must be a valid enum value.`,
	})
	@ApiPropertyOptional({
		example: House.BARBARIAN,
		description: 'User house',
		enum: House,
		type: String,
	})
	house?: House;

	@IsOptional()
	@IsEnum(Role, {
		message: `Role must be a valid enum value: ${Role.DEV} or ${Role.MEMBER}`,
	})
	@ApiPropertyOptional({
		example: Role.MEMBER,
		description: 'User role',
		enum: Role,
		type: String,
		default: Role.MEMBER,
	})
	role?: Role;

	@IsOptional()
	@Matches(/^\d{8}$/, { message: 'student id should be 8-digit number ' })
	@ApiPropertyOptional({
		example: '67011501',
		description: 'student id',
		type: String,
	})
	studentId?: string;
}
