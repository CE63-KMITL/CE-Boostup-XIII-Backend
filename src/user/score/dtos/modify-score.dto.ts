import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ModifyScoreDto {
	@Expose()
	@ApiProperty({
		example: 'f789f66d-8e8e-4df0-9d12-c6aeaf930ce6',
		description: 'User uuid',
		type: String,
	})
	userId: string;

	@Expose()
	@ApiProperty({
		example: 10,
		description: 'Amount of score to add or subtract',
		type: Number,
	})
	amount: number;

	@Expose()
	@ApiProperty({
		example: 'Message',
		description: 'Message',
		type: String,
	})
	@IsOptional()
	message: string = 'ไม่รู้อะแค่เปลี่ยนคะแนนเฉยๆ';
}
