import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRewardDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		description: 'Name of the reward',
		example: 'hello world',
	})
	name?: string;

	@IsOptional()
	@IsNumber()
	@ApiPropertyOptional({
		description: 'Points required to redeem the reward',
		example: 100,
	})
	points?: number;
}
