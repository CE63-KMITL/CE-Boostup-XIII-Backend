import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { House } from 'src/shared/enum/house.enum';
import { AvailableRole } from 'src/shared/enum/role.enum';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';

export class UserQueryDto extends PaginationMetaDto {
	@ApiPropertyOptional({
		example: false,
		type: Boolean,
		description:
			'null for defualt true sort from highest score false from reverse',
	})
	@Transform(({ value }) =>
		value === undefined
			? undefined
			: value === 'true'
				? true
				: value === 'false'
					? false
					: undefined,
	)
	@IsBoolean()
	@IsOptional()
	orderByScore?: boolean;

	@ApiPropertyOptional({
		example: 'example',
		type: String,
		description: 'search by name',
	})
	@IsOptional()
	@IsString()
	name?: string;

	@ApiPropertyOptional({
		example: 'example@gmail.com',
		type: String,
		description: 'search by email',
	})
	@IsString()
	@IsOptional()
	email?: string;

	@ApiPropertyOptional({
		example: House.BARBARIAN,
		enum: House,
		description: 'search from house',
	})
	@IsEnum(House)
	@IsOptional()
	house?: House;

	@ApiPropertyOptional({
		example: AvailableRole.MEMBER,
		enum: AvailableRole,
		description: 'search from role',
	})
	@IsOptional()
	@IsEnum(AvailableRole)
	role: AvailableRole = AvailableRole.MEMBER;
}
