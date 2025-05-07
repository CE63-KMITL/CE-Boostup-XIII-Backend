import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { CreateTestCaseDto } from '../test_case/dto/create-test-case.dto';

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
	@IsOptional()
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
		type: CreateTestCaseDto,
		isArray: true,
	})
	@IsArray()
	@IsNotEmpty()
	testCases: CreateTestCaseDto[];

	@ApiPropertyOptional({ example: ['string.h'] })
	@IsOptional()
	@IsString({ each: true })
	disallowHeaders?: string[];

	@ApiPropertyOptional({ example: ['for'] })
	@IsOptional()
	@IsString({ each: true })
	disallowFunctions?: string[];

	@ApiPropertyOptional({ example: ['string.h'] })
	@IsOptional()
	@IsString({ each: true })
	allowHeaders?: string[];

	@ApiPropertyOptional({ example: ['for'] })
	@IsOptional()
	@IsString({ each: true })
	allowFunctions?: string[];
}
