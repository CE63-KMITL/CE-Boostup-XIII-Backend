import { ApiProperty } from '@nestjs/swagger';
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { ProblemAllowMode } from '../enum/problem-allow-mode.enum';
import { TestCase } from '../test_case/test-case.object';

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
	solutionCode?: string;

	@ApiProperty({ example: 3, description: 'Difficulty level (0.5 to 5)' })
	@IsNumber()
	difficulty?: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

	@ApiProperty({ example: ['Basic I/O', 'If - else'] })
	@IsOptional()
	@IsArray()
	tags?: string[];

	@ApiProperty({
		example: [
			{
				input: '',
				isHiddenTestcase: false,
			},

			{
				input: '1',
				isHiddenTestcase: true,
			},
		],
		isArray: true,
		type: TestCase,
	})
	@IsArray()
	testCases: TestCase[];
}
