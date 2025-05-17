import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/shared/pagination/dto/paginated-response.dto';
import {
	UserMediumResponseDto,
	UserSmallResponseDto,
} from 'src/user/dtos/user-response.dto';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from '../enums/problem-staff-status.enum';
import { Problem } from '../problem.entity';
import { ScoreValue } from '../types/score-value.type';
import {
	TestCaseFilteredResponseDto,
	TestCaseResponseDto,
} from '../test_case/dtos/test-case-response.dto';
import { Exclude, Filter } from 'src/shared/dto.extension';
import { ProblemAllowMode } from '../enums/problem-allow-mode.enum';

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

	@ApiProperty({
		example: 1000,
		description: 'time limit of problem',
		type: Number,
	})
	timeLimit: number;

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
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
		description: 'solution code',
		type: String,
	})
	solutionCode: string;

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

	@ApiPropertyOptional({
		example: 'Given an integer n, the task is to find the solution to the n-queens problem,',
		description: 'problem rejected message',
		type: String,
	})
	rejectedMessage?: string;

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

	@ApiPropertyOptional({
		example: ProblemAllowMode.DISALLOWED,
	})
	functionMode?: ProblemAllowMode;

	@ApiPropertyOptional({
		example: ProblemAllowMode.DISALLOWED,
	})
	headerMode?: ProblemAllowMode;

	@ApiPropertyOptional({ example: ['string.h'] })
	headers?: string[] = [];

	@ApiPropertyOptional({ example: ['for'] })
	functions?: string[] = [];

	constructor(problem: Problem) {
		this.id = problem.id;
		this.title = problem.title;
		this.description = problem.description;
		this.defaultCode = problem.defaultCode;
		this.difficulty = problem.difficulty;
		this.devStatus = problem.devStatus;
		this.tags = problem.tags;
		this.rejectedMessage = problem.rejectedMessage;
		this.testCases = problem.testCases.map(
			(testCase) => new TestCaseResponseDto(testCase),
		);
		this.author = new UserMediumResponseDto(problem.author);
		this.timeLimit = problem.timeLimit;
		this.solutionCode = problem.solutionCode;
		this.headers = problem.headers;
		this.functions = problem.functions;
		this.functionMode = problem.functionMode;
		this.headerMode = problem.headerMode;
	}
}

export class ProblemFilteredResponse extends Exclude(ProblemResponseDto, [
	'devStatus',
	'rejectedMessage',
	'timeLimit',
	'solutionCode',
]) {
	@ApiProperty({
		description: 'author of problem',
		type: UserSmallResponseDto,
	})
	author: UserSmallResponseDto;

	constructor(problem: Problem) {
		super(problem);
		this.author = new UserSmallResponseDto(problem.author);
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
	'author',
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

	constructor(
		problem: Problem,
		status?: ProblemStatusEnum | ProblemStaffStatusEnum,
	) {
		super(problem);
		this.status = status;
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

export class ProblemCodeResponseDto extends Exclude(ProblemFilteredResponse, [
	'testCases',
]) {
	@ApiProperty({
		example: [
			{
				isHiddenTestcase: true,
			},
			{
				input: 'abc',
				expectOutput: 'abc',
				isHiddenTestcase: false,
			},
		],
		description: 'test cases of problem',
		type: TestCaseFilteredResponseDto,
		isArray: true,
	})
	testCases: TestCaseFilteredResponseDto[];

	constructor(problem: Problem) {
		super(problem);
		this.testCases = problem.testCases.map(
			(testCase) => new TestCaseFilteredResponseDto(testCase),
		);
	}
}
