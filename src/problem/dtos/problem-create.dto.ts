import { ApiProperty } from '@nestjs/swagger';
import {
	IsArray,
	IsEnum,
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { ProblemAllowMode } from '../enums/problem-allow-mode.enum';
import { CreateTestCase, TestCase } from '../test_case/test-case.object';
import { Type } from 'class-transformer';
import { SCORE_VALUES, ScoreValue } from '../types/score-value.type';

export class CreateProblemDto {
	@ApiProperty({ example: 'Sample Problem Title' })
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiProperty({ example: 'Sample problem description' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Time limit in milliseconds',
		example: 100,
		default: 100,
	})
	@IsNumber()
	@IsOptional()
	timeLimit: number = 100;

	@ApiProperty({
		example: ProblemAllowMode.DISALLOWED,
		enum: ProblemAllowMode,
	})
	@IsEnum(ProblemAllowMode)
	@IsOptional()
	headerMode: ProblemAllowMode = ProblemAllowMode.DISALLOWED;

	@ApiProperty({
		example: ['stdio.h'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	headers: string[] = [];

	@ApiProperty({
		example: ProblemAllowMode.DISALLOWED,
		enum: ProblemAllowMode,
	})
	@IsOptional()
	@IsEnum(ProblemAllowMode)
	functionMode: ProblemAllowMode = ProblemAllowMode.DISALLOWED;

	@ApiProperty({
		example: ['for'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	functions: string[] = [];

	@ApiProperty({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
	})
	@IsOptional()
	@IsString()
	defaultCode?: string;

	@ApiProperty({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
	})
	@IsString()
	@IsNotEmpty()
	solutionCode: string;

	@ApiProperty({ example: 3, description: 'Difficulty level (0.5 to 5)' })
	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@IsIn(SCORE_VALUES)
	difficulty: ScoreValue;

	@ApiProperty({ example: ['Basic I/O', 'If - else'] })
	@IsOptional()
	@IsArray()
	tags?: string[];

	@ApiProperty({
		type: [TestCase],
		description: 'Test cases for the problem',
	})
	@ValidateNested({ each: true })
	@IsArray()
	@Type(() => CreateTestCase)
	testCases: CreateTestCase[];
}
