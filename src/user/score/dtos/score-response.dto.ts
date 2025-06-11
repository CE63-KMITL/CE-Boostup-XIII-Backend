import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ScoreLog } from '../score-log.entity';
import { UserLogReponseDto } from 'src/user/dtos/user-log-response.dto';

export class UserScoreResponseDto {
	@Expose()
	@ApiProperty({
		example: 0,
		description: 'User score',
		type: Number,
	})
	score: number;

	@Expose()
	@ApiProperty({
		example: [],
		description: 'User score logs',
		type: [ScoreLog],
	})
	scoreLogs: UserLogReponseDto[];

	constructor(score: number, scoreLogs: ScoreLog[]) {
		this.score = score;
		this.scoreLogs = scoreLogs.map(
			(log) => new UserLogReponseDto(log.modifiedBy),
		);
	}
}
