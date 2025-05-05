import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RunCodeResponseDto {
	@Expose()
	@ApiProperty({
		example: '*code output*',
		description: 'code output',
		type: String,
	})
	output: string;

	@Expose()
	@ApiProperty({
		example: 0,
		description: 'exit code',
		type: Number,
	})
	exit_code: number;

	@Expose()
	@ApiProperty({
		example: '*error message*',
		description: 'error message',
		type: String,
	})
	error_message: string;

	@Expose()
	@ApiProperty({
		example: 0,
		description: 'used time',
		type: Number,
	})
	used_time: number;

	constructor(partial: Partial<RunCodeResponseDto>) {
		Object.assign(this, partial);
	}
}

export class RunCodePostDto {
	@ApiProperty({
		description: 'Input for the code execution',
		example: '1 2',
	})
	@IsString()
	@IsOptional()
	input: string;

	@ApiProperty({
		description: 'The code to be executed',
		example: 'print(sum(map(int, input().split())))',
	})
	@IsString()
	code: string;

	@ApiProperty({
		description: 'Timeout for the code execution in milliseconds',
		example: 1000,
	})
	@IsNumber()
	@IsOptional()
	timeout: number;
}
