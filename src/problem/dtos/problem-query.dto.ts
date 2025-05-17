import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsIn,
	IsOptional,
	IsString,
} from 'class-validator';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from '../enums/problem-staff-status.enum';
import { SCORE_VALUES, ScoreValue } from '../types/score-value.type';
import { SortBy } from 'src/shared/enum/sort-by.enum';

export class ProblemSearchQueryDto extends PaginationMetaDto {
	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		example: 'sample title',
		type: String,
		description: 'Search by ID or author name or problem name',
	})
	searchText?: string;

	@IsOptional()
	@IsBoolean()
	@ApiPropertyOptional({
		example: true,
		type: Boolean,
		description: 'Sort by ID in reverse order',
	})
	@Transform(({ value }) => (value === 'true' ? true : false))
	idReverse?: boolean;

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
	minDifficulty: ScoreValue = 1;

	@IsOptional()
	@Type(() => Number)
	@IsIn(SCORE_VALUES)
	@ApiPropertyOptional({
		example: '5',
		type: String,
	})
	maxDifficulty: ScoreValue = 5;

	@IsOptional()
	@IsIn([
		...Object.values(ProblemStatusEnum),
		...Object.values(ProblemStaffStatusEnum),
	])
	@ApiPropertyOptional({
		example: ProblemStatusEnum.IN_PROGRESS,
		enum: ProblemStatusEnum,
	})
	status?: ProblemStatusEnum | ProblemStaffStatusEnum;

	@IsOptional()
	@IsString()
	@IsEnum(SortBy)
	@ApiPropertyOptional({
		example: SortBy.ASC,
		enum: SortBy,
	})
	difficultySortBy: SortBy = null;

	@IsOptional()
	@IsBoolean()
	@Transform((staff) => (staff.value === 'true' ? true : false))
	@ApiPropertyOptional({
		type: Boolean,
		description: 'For Satff',
	})
	staff?: boolean;

	@IsOptional()
	@IsString()
	@ApiPropertyOptional({
		type: String,
		example: 'author',
	})
	author: string;
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
