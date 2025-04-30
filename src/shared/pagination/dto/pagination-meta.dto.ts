import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';

export class PaginationMetaDto<T> {
	@ApiPropertyOptional({
		type: Number,
		example: 1,
		default: 1,
	})
	@IsInt()
	@Min(1)
	@Type(() => Number)
	page?: number = 1;

	@ApiPropertyOptional({
		type: Number,
		example: 15,
		default: 15,
	})
	@IsInt()
	@Min(1)
	@Type(() => Number)
	limit?: number = GLOBAL_CONFIG.DEFAULT_PROBLEM_PAGE_SIZE;

	@ApiPropertyOptional({
		type: String,
	})
	@IsString()
	@IsOptional()
	searchField?: keyof T;

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	searchTerm?: string;
}
