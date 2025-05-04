import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { PaginatedResponseDto } from 'src/shared/pagination/dto/paginated-response.dto';
import { UserResponseDto } from 'src/user/dtos/user-response.dto';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from '../enum/problem-staff-status.enum';
import { Problem } from '../problem.entity';
import { ScoreValue } from '../type/score-value.type';

export class ProblemResponseDto {
	@ApiProperty({
		example: '1',
		description: 'problem id',
		type: Number,
	})
	id: number;

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

	@ApiProperty({
		example: ProblemStaffStatusEnum.ARCHIVED,
		description: 'current status of problem',
		enum: ProblemStaffStatusEnum,
	})
	devStatus: ProblemStaffStatusEnum;

	@ApiPropertyOptional({
		example: ['Basic I/O', 'If - else'],
		description: 'tag of problem',
		type: String,
		isArray: true,
	})
	tags?: string[];

	@ApiProperty({
		description: 'author of problem',
		type: UserResponseDto,
	})
	author: UserResponseDto;

	@ApiPropertyOptional({ example: ['#include<string.h>'] })
	disallowHeaders?: string[];

	@ApiPropertyOptional({ example: ['for'] })
	disallowFunctions?: string[];

	constructor(problem: Problem) {
		this.id = problem.id;
		this.title = problem.title;
		this.description = problem.description;
		this.defaultCode = problem.defaultCode;
		this.difficulty = problem.difficulty;
		this.devStatus = problem.devStatus;
		this.tags = problem.tags;
		this.disallowFunctions = problem.disallowFunctions;
		this.disallowHeaders = problem.disallowHeaders;
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

export class ProblemPaginatedDto extends PaginatedResponseDto(
	ProblemResponseDto,
) {
	constructor(
		problems: Problem[],
		totalItem: number,
		page: number,
		limit: number,
	) {
		const problemsResponse = problems.map(
			(problem) => new ProblemResponseDto(problem),
		);
		super(problemsResponse, totalItem, page, limit);
	}
}
