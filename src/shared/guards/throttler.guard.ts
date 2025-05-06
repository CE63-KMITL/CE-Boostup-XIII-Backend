import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
	//add path that need to send mail here
	private sendMailPath = ['/auth/request-open-account'];
	private isLimitedPath(req: Request): boolean {
		return (
			req.body &&
			req.body.email &&
			this.sendMailPath.includes(req.route.path)
		);
	}
	protected getTracker(req: Record<string, any>): Promise<string> {
		if (this.isLimitedPath(req as Request)) return req.body.email;
		return req.ip;
	}
	protected async handleRequest(
		requestProps: ThrottlerRequest,
	): Promise<boolean> {
		const { context } = requestProps;
		const req = context.switchToHttp().getRequest();
		// 50 requests per 1 minutes
		let ttl = 60 * 1000;
		let limit = 50;
		let blockDuration = 5 * 1000;
		if (this.isLimitedPath(req)) {
			ttl = 60 * 1000;
			limit = 1;
			blockDuration = 60 * 1000;
		}
		return super.handleRequest({
			...requestProps,
			ttl,
			limit,
			blockDuration,
		});
	}
}
