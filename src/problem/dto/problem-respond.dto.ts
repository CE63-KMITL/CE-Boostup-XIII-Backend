import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/shared/pagination/dto/paginated-response.dto';
import {
	UserMediumResponseDto,
	UserSmallResponseDto,
} from 'src/user/dtos/user-response.dto';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from '../enum/problem-staff-status.enum';
import { Problem } from '../problem.entity';
import { ScoreValue } from '../type/score-value.type';
import { Filter } from 'src/shared/dto.extension';
import { TestCaseResponseDto } from '../test_case/dto/test-case-response.dto';

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
		example: [
			{
				id: '92d62009-a247-40e9-a901-928c8a9b5a40',
				input: 'abc',
				expectOutput: 'abc',
				isHiddenTestcase: true,
			},
		],
		description: 'test cases of problem',
		type: TestCaseResponseDto,
		isArray: true,
	})
	testCases: TestCaseResponseDto[];

	@ApiProperty({
		description: 'author of problem',
		type: UserMediumResponseDto,
	})
	author: UserMediumResponseDto;

	@ApiPropertyOptional({ example: ['string.h'] })
	disallowHeaders?: string[];

	@ApiPropertyOptional({ example: ['for'] })
	disallowFunctions?: string[];

	constructor(problem: Problem) {
		Object.assign(this, problem);
		this.author = new UserMediumResponseDto(problem.author);
		this.testCases = problem.testCases.map(
			(testCase) => new TestCaseResponseDto(testCase),
		);
	}
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

export class ProblemSearchedDto extends Filter(ProblemResponseDto, [
	'id',
	'title',
	'difficulty',
	'tags',
]) {
	@ApiProperty({
		example: ProblemStaffStatusEnum.PUBLISHED,
		description: 'current status of problem',
		enum: {
			...ProblemStaffStatusEnum,
			...ProblemStatusEnum,
		},
	})
	status: ProblemStatusEnum | ProblemStaffStatusEnum;

	@ApiProperty({
		description: 'author of problem',
		type: UserSmallResponseDto,
	})
	author: UserSmallResponseDto;

	constructor(
		problem: Problem,
		status?: ProblemStatusEnum | ProblemStaffStatusEnum,
	) {
		super(problem);

		this.status = status;
		this.author = new UserSmallResponseDto(problem.author);
	}
}

export class ProblemSearchedPaginatedDto extends PaginatedResponseDto(
	ProblemSearchedDto,
) {
	constructor(
		problems: Problem[],
		totalItem: number,
		page: number,
		limit: number,
	) {
		const problemsResponse = problems.map(
			(problem) => new ProblemSearchedDto(problem),
		);
		super(problemsResponse, totalItem, page, limit);
	}
}
