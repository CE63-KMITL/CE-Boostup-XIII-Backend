import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRewardDto {
	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		description: 'Name of the reward',
		example: 'hello world',
	})
	name: string;

	@IsNotEmpty()
	@IsNumber()
	@ApiProperty({
		description: 'Points required to redeem the reward',
		example: 100,
	})
	points: number;
}
