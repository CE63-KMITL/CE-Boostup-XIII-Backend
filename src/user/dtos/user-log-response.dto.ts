import { House } from 'src/shared/enum/house.enum';
import { Role } from 'src/shared/enum/role.enum';
import { User } from '../user.entity';

export class UserLogReponseDto {
	id: string;

	name: string;

	email: string;

	house: House;

	role: Role;

	constructor(user: User) {
		this.id = user.id;
		this.name = user.name;
		this.email = user.email;
		this.house = user.house;
		this.role = user.role;
	}
}
