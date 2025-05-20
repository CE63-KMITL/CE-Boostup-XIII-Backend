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
		example: 0,
		description: 'used time',
		type: Number,
	})
	used_time: number;

	constructor(runCodeResult: Partial<RunCodeResponseDto>) {
		this.output = runCodeResult.output;
		this.exit_code = runCodeResult.exit_code;
		this.exit_status = runCodeResult.exit_status;
		this.used_time = runCodeResult.used_time;
	}
}
