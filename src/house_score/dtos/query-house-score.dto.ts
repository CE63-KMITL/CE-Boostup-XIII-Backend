import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SortBy } from 'src/shared/enum/sort-by.enum';

export class QueryHouseScoreDto {
	@ApiPropertyOptional({
		example: SortBy.ASC,
		enum: SortBy,
	})
	@IsOptional()
	@IsEnum(SortBy)
	orderBy?: SortBy = SortBy.ASC;
}
