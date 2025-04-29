import { ApiProperty } from '@nestjs/swagger';
import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { ProblemStatusEnum } from '../enum/problem-staff-status.enum';
import { ProblemStaffStatusEnum } from '../enum/problem-staff-status.enum';

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

	@ApiProperty({ example: 3, description: 'Difficulty level (0.5 to 5)' })
	@IsOptional()
	@IsNumber()
	difficulty?: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

	@ApiProperty({ example: ['Basic I/O', 'If - else'] })
	@IsOptional()
	@IsArray()
	tags?: string[];
}

enum ProblemSearchSortBy {
	ASC = 'ASC',
	DESC = 'DESC',
}

export class ProblemSearchRequest {
	@IsOptional()
	@IsString()
	searchText: string;

	@IsOptional()
	@IsString()
	idReverse: string;

	@IsOptional()
	@IsString()
	tags: string;

	@IsOptional()
	@IsString()
	minDifficulty: string = '0.5';

	@IsOptional()
	@IsString()
	maxDifficulty: string = '5';

	@IsOptional()
	@IsString()
	status: ProblemStatusEnum | ProblemStaffStatusEnum;

	@IsOptional()
	@IsString()
	page: string = '1';

	@IsOptional()
	@IsString()
	@IsEnum(ProblemSearchSortBy)
	difficultySortBy: ProblemSearchSortBy = ProblemSearchSortBy.ASC;
}
