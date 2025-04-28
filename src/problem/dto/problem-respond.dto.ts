import { IsNumber } from 'class-validator';
import { ProblemStatusEnum } from 'src/user/score/problem-status.entity';
import { Problem } from '../problem.entity';

export class ProblemWithUserStatus extends Problem {
	status: ProblemStatusEnum;
}

export class ProblemSearchRespond {
	items: ProblemWithUserStatus[];

	@IsNumber()
	pageCount: number;
}
