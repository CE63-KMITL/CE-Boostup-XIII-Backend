import { IsNumber } from 'class-validator';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from '../enum/problem-staff-status.enum';
import { Problem } from '../problem.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScoreValue } from '../type/score-value.type';
import { UserResponseDto } from 'src/user/dtos/user-response.dto';

export class ProblemResponseDto {
	@ApiProperty({
		example: 'f789f66d-8e8e-4df0-9d12-c6aeaf930ce6',
		description: 'problem uuid',
		type: String,
	})
	id: string;

	@ApiProperty({
		example: 'n-queen',
		description: 'problem title',
		type: String,
	})
	title: string;

	@ApiPropertyOptional({
		example: 'Given an integer n, the task is to find the solution to the n-queens problem,',
		description: 'problem description',
		type: String,
	})
	description?: string;

	@ApiPropertyOptional({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
		description: 'default code',
		type: String,
	})
	defaultCode?: string;

	@ApiProperty({
		example: '2',
		description: 'difficulty of problem',
		type: Number,
	})
	difficulty: ScoreValue;

	@ApiPropertyOptional({
		example: ProblemStaffStatusEnum.ARCHIVED,
		description: 'current status of problem',
		enum: ProblemStaffStatusEnum,
	})
	devStatus?: ProblemStaffStatusEnum;

	@ApiPropertyOptional({
		example: ['Basic I/O', 'If - else'],
		description: 'tag of problem',
		type: String,
		isArray: true,
	})
	tag?: string[];

	@ApiProperty({
		description: 'author of problem',
		type: UserResponseDto,
	})
	author: UserResponseDto;

	constructor(problem: Problem) {
		this.id = problem.id;
		this.title = problem.title;
		this.description = problem.description;
		this.defaultCode = problem.defaultCode;
		this.difficulty = problem.difficulty;
		this.devStatus = problem.devStatus;
		this.tag = problem.tags;
		this.author = new UserResponseDto(problem.author);
	}
}

export class ProblemWithUserStatus extends Problem {
	status: ProblemStatusEnum;
}

export class ProblemSearchRespond {
	items: ProblemWithUserStatus[];

	@IsNumber()
	pageCount: number;
}
