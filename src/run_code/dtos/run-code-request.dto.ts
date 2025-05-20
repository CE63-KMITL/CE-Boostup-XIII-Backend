import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { ProblemAllowMode } from 'src/problem/enums/problem-allow-mode.enum';

export class RunCodeRequestDto {
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
		example: 100,
	})
	@IsNumber()
	@IsOptional()
	timeout: number = 100;

	@ApiProperty({
		description: 'The mode for the function execution',
		example: ProblemAllowMode.ALLOWED,
		enum: ProblemAllowMode,
	})
	@IsOptional()
	@IsEnum(ProblemAllowMode)
	functionMode: ProblemAllowMode;

	@ApiProperty({
		description: 'The mode for the header execution',
		example: ProblemAllowMode.ALLOWED,
		enum: ProblemAllowMode,
	})
	@IsOptional()
	@IsEnum(ProblemAllowMode)
	headerMode: ProblemAllowMode;

	@ApiProperty({
		description: 'The headers to be used in the code execution',
		example: ['stdio.h'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	headers: string[];

	@ApiProperty({
		description: 'The functions to be used in the code execution',
		example: ['sum', 'map'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	functions: string[];
}

export class RunCodeTestCasesRequestDto extends OmitType(RunCodeRequestDto, [
	'input',
]) {
	@ApiProperty({
		description: 'Input for the code execution',
		example: ['1 2', '3 4'],
	})
	@IsString({ each: true })
	@IsOptional()
	@IsArray()
	inputs: string[];
}
