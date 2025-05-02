import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';

export class PaginationMetaDto {
	@ApiPropertyOptional({
		type: Number,
		example: 1,
		default: 1,
	})
	@IsInt()
	@IsOptional()
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
	@IsOptional()
	@Type(() => Number)
	limit?: number = GLOBAL_CONFIG.DEFAULT_PROBLEM_PAGE_SIZE;
}
