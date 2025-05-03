import { ApiProperty } from '@nestjs/swagger';
import {
	IsArray,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { ProblemStaffStatusEnum } from '../enum/problem-staff-status.enum';

export class UpdateProblemDto {
	@ApiProperty({ example: 'Updated Problem Title', required: false })
	@IsOptional()
	@IsString()
	title?: string;

	@ApiProperty({ example: 'Updated problem description', required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
		required: false,
	})
	@IsOptional()
	@IsString()
	defaultCode?: string;
	
	@ApiProperty({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
		required: false,
	})
	@IsOptional()
	@IsString()
	solutionCode?: string;

	@ApiProperty({
		example: 4,
		description: 'Updated difficulty level (0.5 to 5)',
		required: false,
	})
	@IsOptional()
	@IsNumber()
	difficulty: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

	@ApiProperty({
		example: ProblemStaffStatusEnum.IN_PROGRESS,
		enum: ProblemStaffStatusEnum,
		required: false,
	})
	@IsOptional()
	@IsEnum(ProblemStaffStatusEnum)
	devStatus?: ProblemStaffStatusEnum;

	@ApiProperty({ example: ['meme', 'algorithm'], required: false })
	@IsOptional()
	@IsArray()
	tags: string[];
}
