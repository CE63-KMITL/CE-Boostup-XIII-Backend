import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ModifyScoreDto {
	@ApiProperty({
		example: 'f789f66d-8e8e-4df0-9d12-c6aeaf930ce6',
		description: 'User uuid',
		type: String,
	})
	@IsString()
	userId: string;

	@ApiProperty({
		example: 10,
		description: 'Amount of score to add or subtract',
		type: Number,
	})
	@IsNumber()
	amount: number;

	@ApiProperty({
		example: 'Message',
		description: 'Message',
		type: String,
	})
	@IsOptional()
	message: string = 'ไม่รู้อะแค่เปลี่ยนคะแนนเฉยๆ';
}
