import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { House } from 'src/shared/enum/house.enum';

export class CreateHouseScoreDto {
	@IsEnum(House)
	@IsNotEmpty()
	@ApiProperty({
		description: 'Name of the house',
		example: House.BARBARIAN,
		enum: House,
	})
	name: string;

	@IsNumber()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Score value',
		example: 100,
		type: Number,
	})
	value: number;
}

export class UpdateHouseScoreDto {
	@IsNumber()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Score value',
		example: 100,
		type: Number,
	})
	value: number;
}
