import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserSaveCodeDto {
	@ApiProperty({ description: 'The code string to save' })
	@IsString()
	code: string;
}
