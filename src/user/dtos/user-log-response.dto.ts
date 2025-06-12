import { ScoreLog } from '../score/score-log.entity';
import { User } from '../user.entity';
import { UserMediumResponseDto } from './user-response.dto';

export class UserLogReponseDto {
	id: string;
	amount: number;
	message: string;
	modifiedBy: UserMediumResponseDto;
	date: Date;
	constructor(scoreLog: ScoreLog) {
		this.id = scoreLog.id;
		this.modifiedBy = new UserMediumResponseDto(scoreLog.modifiedBy);
		this.date = scoreLog.date;
		this.amount = scoreLog.amount;
		this.message = scoreLog.message;
	}
}
