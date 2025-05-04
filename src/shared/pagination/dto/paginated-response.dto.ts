import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function PaginatedResponseDto<T>(ItemType: Type<T>) {
	class PaginatedResponseClass {
		@ApiProperty({
			example: 10,
			description: 'total number of items',
		})
		totalItem: number;

		@ApiProperty({
			example: 4,
			description: 'current page',
		})
		page: number;

		@ApiProperty({
			example: 5,
			description: 'total page',
		})
		totalPage: number;

		@ApiProperty({
			example: 15,
			description: 'limit item per page',
		})
		limit: number;

		@ApiProperty({ isArray: true, type: ItemType })
		data: T[];

		constructor(
			data: T[],
			totalItem: number,
			page: number,
			limit: number,
		) {
			this.data = data;
			this.totalItem = totalItem;
			this.page = page;
			this.limit = limit;

			this.updateTotalPage();
		}

		updateTotalPage() {
			this.totalPage = Math.ceil(this.totalItem / this.limit);
		}
	}

	return PaginatedResponseClass;
}
