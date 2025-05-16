import {
	CanActivate,
	ExecutionContext,
	Injectable,
	ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProblemService } from '../problem.service';
import { Role } from '../../shared/enum/role.enum';
import { ProblemStaffStatusEnum } from '../enums/problem-staff-status.enum';
import { authenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@Injectable()
export class ProblemPublishedGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly problemService: ProblemService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context
			.switchToHttp()
			.getRequest<authenticatedRequest>();
		const problemId = +request.params.id || +request.params.problemId;

		if (!problemId) {
			return true;
		}

		const problem = await this.problemService.findOne(problemId);

		if (
			request.user.role === Role.MEMBER &&
			problem.devStatus !== ProblemStaffStatusEnum.PUBLISHED
		) {
			throw new ForbiddenException();
		}

		return true;
	}
}
