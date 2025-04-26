import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { House } from 'src/shared/enum/house.enum';

export class RegisterUserDto {
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({
		example: 'example@gmail.com',
		description: 'Email',
		type: String,
	})
	email: string;

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
}
