import { Injectable } from '@nestjs/common';
import { House } from 'src/shared/enum/house.enum';
import { UserService } from 'src/user/user.service';

@Injectable()
export class HouseService {
	constructor(private readonly userService: UserService) {}

	async get_all_users_in_house(house: House) {
		return await this.userService.findUsersByHouse(house);
	}
}
