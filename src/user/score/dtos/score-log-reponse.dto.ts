import { User } from '../../user.entity';
import { ScoreLog } from '../score-log.entity';
import { UserLogReponseDto } from 'src/user/dtos/user-log-response.dto';

export class ScoreLogResponseDto {
	id: string;

	amount: number;

	date: Date;

	modifiedBy: UserLogReponseDto;

	message: string;

	constructor(scoreLog: ScoreLog) {
		this.id = scoreLog.id;
		this.amount = scoreLog.amount;
		this.date = scoreLog.date;
		this.modifiedBy = new UserLogReponseDto(scoreLog.modifiedBy);
		this.modifiedBy = scoreLog.modifiedBy;
		this.message = scoreLog.message;
	}
}
