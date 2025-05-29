import { ExecutionContext, Injectable } from '@nestjs/common';
import {
	ThrottlerGuard,
	ThrottlerStorage,
	ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { Role } from '../../shared/enum/role.enum';
import { authenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
	constructor(
		protected readonly options: ThrottlerModuleOptions,
		protected readonly storageService: ThrottlerStorage,
		protected readonly reflector: Reflector,
	) {
		super(options, storageService, reflector);
	}

	protected async getTracker(req: Record<string, any>): Promise<string> {
		const tracker = req.ips?.length ? req.ips[0] : req.ip;
		return tracker;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context
			.switchToHttp()
			.getRequest<authenticatedRequest & Request>();

		if (request.user && request.user.role === Role.DEV) {
			return true;
		}

		return super.canActivate(context);
	}
}
