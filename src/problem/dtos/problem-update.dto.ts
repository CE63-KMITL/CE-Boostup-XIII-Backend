import {
	IsArray,
	IsEnum,
	IsIn,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProblemAllowMode } from '../enums/problem-allow-mode.enum';
import { TestCase, CreateTestCase } from '../test_case/test-case.object';
import { SCORE_VALUES, ScoreValue } from '../types/score-value.type';

export class UpdateProblemDto {
	@ApiPropertyOptional({ example: 'Sample Problem Title' })
	@IsOptional()
	@IsString()
	title: string;

	@ApiPropertyOptional({ example: 'Sample problem description' })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional({
		description: 'Time limit in milliseconds',
		example: 100,
		default: 100,
	})
	@IsNumber()
	@IsOptional()
	timeLimit?: number = 100;

	@ApiPropertyOptional({
		example: ProblemAllowMode.DISALLOWED,
		enum: ProblemAllowMode,
	})
	@IsEnum(ProblemAllowMode)
	@IsOptional()
	headerMode?: ProblemAllowMode;

	@ApiPropertyOptional({
		example: ['stdio.h'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	headers?: string[];

	@ApiPropertyOptional({
		example: ProblemAllowMode.DISALLOWED,
		enum: ProblemAllowMode,
	})
	@IsOptional()
	@IsEnum(ProblemAllowMode)
	functionMode?: ProblemAllowMode;

	@ApiPropertyOptional({
		example: ['for'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	functions?: string[];

	@ApiPropertyOptional({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
	})
	@IsOptional()
	@IsString()
	defaultCode?: string;

	@ApiPropertyOptional({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
	})
	@IsString()
	@IsOptional()
	solutionCode?: string;

	@ApiPropertyOptional({
		example: 3,
		description: 'Difficulty level (0.5 to 5)',
	})
	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@IsIn(SCORE_VALUES)
	difficulty?: ScoreValue;

	@ApiPropertyOptional({ example: ['Basic I/O', 'If - else'] })
	@IsOptional()
	@IsArray()
	tags?: string[];

	@ApiPropertyOptional({
		type: [TestCase],
		description: 'Test cases for the problem',
	})
	@ValidateNested({ each: true })
	@IsArray()
	@Type(() => CreateTestCase)
	@IsOptional()
	testCases?: CreateTestCase[];
}
