import { ApiProperty } from '@nestjs/swagger';
import { RunCodeExitStatusEnum } from '../enum/run-code-exit-status.enum';

export class RunCodeResponseDto {
	@ApiProperty({
		example: '*code output*',
		description: 'code output',
		type: String,
	})
	output: string;

	@ApiProperty({
		example: 0,
		description: 'exit code',
		type: Number,
	})
	exit_code: number;

	@ApiProperty({
		example: RunCodeExitStatusEnum.SUCCESS,
		description: 'runcode status',
		enum: RunCodeExitStatusEnum,
	})
	exit_status: RunCodeExitStatusEnum;

	@ApiProperty({
		example: '*error message*',
		description: 'error message',
		type: String,
	})
	error_message: string;

	@ApiProperty({
		example: 0,
		description: 'used time',
		type: Number,
	})
	used_time: number;
}
