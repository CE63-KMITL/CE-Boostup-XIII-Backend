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
import { UpdateHouseDto } from './dtos/update-house.dto';
import { RemoveHouseDto } from './dtos/remove-house.dto';
import { AllowRole } from 'src/shared/decorators/auth.decorator';
import { Role } from 'src/shared/enum/role.enum';

@Controller('house')
@ApiTags('House')
export class HouseController {
	constructor(
		private readonly houseService: HouseService,
		private readonly userService: UserService,
	) {}

	@Get(':house')
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get all users in a specific house',
		type: HouseResponseDto,
		isArray: true,
	})
	@AllowRole(Role.MEMBER)
	async findAll(@Param('house') house: House): Promise<string[]> {
		return (await this.houseService.get_all_users_in_house(house)).map(
			(user) => user.id,
		);
	}

	@Patch('update-house')
	@AllowRole(Role.DEV)
	async updateHouse(@Body() body: UpdateHouseDto) {
		return this.userService.updateHouseByEmail(body.email, body.house);
	}

	@Patch('remove-house')
	@AllowRole(Role.DEV)
	async removeUserFromHouse(@Body() body: RemoveHouseDto) {
		return this.userService.removeUserFromHouse(body.email);
	}
}
