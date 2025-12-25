import { UserResponseDto } from 'src/user/dtos/user-response.dto';
import { ScoreLog } from '../score-log.entity';
import { User } from 'src/user/user.entity';

export class ScoreLogResponseDto {
	id: string;

	amount: number;

	date: Date;

	modifiedBy: User;

	message: string;

	constructor(scoreLog: ScoreLog) {
		this.id = scoreLog.id;
		this.amount = scoreLog.amount;
		this.date = scoreLog.date;
		this.modifiedBy = scoreLog.modifiedBy; // Assuming modifiedBy is a User entity;
		this.message = scoreLog.message;
	}
}
