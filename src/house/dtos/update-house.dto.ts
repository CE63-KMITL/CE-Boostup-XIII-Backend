import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { House } from 'src/shared/enum/house.enum';

export class UpdateHouseDto {
	@ApiProperty({ description: 'Email of the user to update' })
	@IsString()
	email: string;

	@ApiProperty({
		description: 'New house for the user',
		enum: House,
		example: House.WARLOCK,
	})
	@IsEnum(House)
	house: House;
}
