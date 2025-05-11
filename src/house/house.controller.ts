import {
	Controller,
	Get,
	HttpStatus,
	Param,
	Patch,
	Body,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { House } from 'src/shared/enum/house.enum';
import { HouseResponseDto } from './dtos/house-response.dto';
import { HouseService } from './house.service';
import { UserService } from 'src/user/user.service';

@Controller('house')
@ApiTags('House')
export class HouseController {
	constructor(
		private readonly houseService: HouseService,
		private readonly userService: UserService, // ต้องเพิ่ม `private readonly` หรือ `public readonly`
	) {}

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

	@Patch('update-house')
	async updateHouse(
		@Body() { email, house }: { email: string; house: House },
	) {
		return this.userService.updateHouseByEmail(email, house);
	}

	@Patch('remove-house')
	async removeUserFromHouse(@Body() { email }: { email: string }) {
		return this.userService.removeUserFromHouse(email);
	}
}
