import { User } from '../user.entity';

export class UserLogReponseDto {
	id: string;
	name: string;
	date: Date;
	constructor(user: User, date: Date) {
		this.id = user.id;
		this.name = user.name;
		this.date = date;
	}
}
