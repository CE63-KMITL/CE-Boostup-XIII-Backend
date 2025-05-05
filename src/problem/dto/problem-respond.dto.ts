import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
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

	constructor(problem: Problem) {
		Object.assign(this, problem);
	}
}

export class ProblemWithUserStatus extends Problem {
	status: ProblemStatusEnum;
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

export class ProblemSearchedDto extends PickType(ProblemResponseDto, [
	'id',
	'title',
	'difficulty',
	'tags',
	'author',
] as const) {

	constructor(problem: Problem) {
		super(problem);
	}
}

// export const ProblemSearchedDto = (
// 	data: Problem,
// 	status?: ProblemStatusEnum | ProblemStaffStatusEnum,
// ) => {
// 	return Filter(data, ['id', 'title', 'difficulty', 'tags', 'author'], {
// 		author: UserSmallResponseDto(data.author),
// 		status,
// 	});
// };

// export class ProblemSearchedDto {
// 	id: typeof ProblemResponseDto.prototype.id;
// 	title: typeof ProblemResponseDto.prototype.title;
// 	description?: typeof ProblemResponseDto.prototype.description;
// 	difficulty: typeof ProblemResponseDto.prototype.difficulty;
// 	status: ProblemStatusEnum | ProblemStaffStatusEnum;
// 	tags?: typeof ProblemResponseDto.prototype.tags;
// 	author: ReturnType<typeof UserSmallResponseDto>;

// 	constructor(
// 		problem: Problem,
// 		config: {
// 			staff: boolean;
// 			status?: ProblemStatusEnum | ProblemStaffStatusEnum;
// 		} = {
// 			staff: false,
// 		},
// 	) {
// 		this.id = problem.id;
// 		this.title = problem.title;
// 		this.description = problem.description;
// 		this.difficulty = problem.difficulty;

// 		if (config.staff) {
// 			this.status = problem.devStatus;
// 		} else {
// 			this.status = config.status ?? ProblemStatusEnum.NOT_STARTED;
// 		}

// 		this.tags = problem.tags;
// 		this.author = UserSmallResponseDto(problem.author);
// 	}
// }

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
