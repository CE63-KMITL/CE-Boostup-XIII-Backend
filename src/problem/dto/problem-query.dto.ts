import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from '../enum/problem-staff-status.enum';
import { SCORE_VALUES, ScoreValue } from '../type/score-value.type';

enum ProblemSearchSortBy {
	ASC = 'ASC',
	DESC = 'DESC',
}

export class ProblemQueryDto extends PaginationMetaDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		example: 'sample title',
		type: String,
		description: 'Search by ID or author name or problem name',
	})
	searchText?: string;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		example: true,
		type: Boolean,
		description: 'Sort by ID in reverse order',
	})
	idReverse?: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) => (Array.isArray(value) ? value : [value]))
	@ApiPropertyOptional({
		example: ['If - else'],
		type: [String],
		description: 'Filter by tags',
	})
	tags?: string[];

	@IsOptional()
	@Type(() => Number)
	@IsIn(SCORE_VALUES)
	@ApiPropertyOptional({
		example: '0.5',
		type: String,
	})
	minDifficulty: ScoreValue = 0.5;

	@IsOptional()
	@Type(() => Number)
	@IsIn(SCORE_VALUES)
	@ApiPropertyOptional({
		example: '5',
		type: String,
	})
	maxDifficulty: ScoreValue = 5;

	@IsOptional()
	@IsEnum(ProblemStaffStatusEnum)
	@ApiPropertyOptional({
		example: ProblemStaffStatusEnum.IN_PROGRESS,
		enum: ProblemStaffStatusEnum,
	})
	status?: ProblemStaffStatusEnum;

	@IsOptional()
	@IsString()
	@IsEnum(ProblemSearchSortBy)
	@ApiPropertyOptional({
		example: ProblemSearchSortBy.ASC,
		enum: ProblemSearchSortBy,
	})
	difficultySortBy: ProblemSearchSortBy = ProblemSearchSortBy.ASC;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		type: Boolean,
		description: 'For Satff',
	})
	staff?: string;
}
export class ProblemUserQueryDto extends PaginationMetaDto {
	@IsOptional()
	@IsEnum(ProblemStatusEnum)
	@ApiPropertyOptional({
		example: ProblemStatusEnum.DONE,
		enum: ProblemStatusEnum,
	})
	status?: ProblemStatusEnum;
}
