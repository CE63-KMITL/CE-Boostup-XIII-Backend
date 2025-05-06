import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { House } from 'src/shared/enum/house.enum';
import { HouseResponseDto } from './dtos/house-response.dto';
import { HouseService } from './house.service';

@Controller('house')
@ApiTags('House')
export class HouseController {
	constructor(private readonly houseService: HouseService) {}

	@Get(':house')
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get all users in a specific house',
		type: HouseResponseDto,
		isArray: true,
	})
	async findAll(@Param('house') house: House): Promise<string[]> {
		return (await this.houseService.get_all_users_in_house(house)).map(
			(user) => user.id,
		);
	}
}
