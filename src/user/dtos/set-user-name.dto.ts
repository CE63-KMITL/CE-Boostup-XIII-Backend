import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SetUserNameDto {
	@ApiProperty({ description: 'The new name for the user' })
	@IsString()
	@IsNotEmpty()
	name: string;
}
