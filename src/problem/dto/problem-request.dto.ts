import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from '../enum/problem-staff-status.enum';

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
	staff: string;

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

export class ProblemRunCodeRequest {
	@ApiProperty({
		description: 'Input for the code execution',
		example: '1 2',
	})
	@IsString()
	input: string;
}
