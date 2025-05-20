import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { Role } from '../../shared/enum/role.enum';
import { authenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
	protected async getTracker(req: Record<string, any>): Promise<string> {
		return req.ips.length ? req.ips[0] : req.ip;
	}

	async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
		const context = requestProps.context;
		const request = context
			.switchToHttp()
			.getRequest<authenticatedRequest>();

		if (request.user && request.user.role === Role.DEV) {
			return true;
		}

		return super.handleRequest(requestProps);
	}
}
