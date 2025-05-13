// roles.guard.ts
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../shared/enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
			'roles',
			[context.getHandler(), context.getClass()],
		);

		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest();

		switch (user.role) {
			case Role.DEV:
				return true;
			case Role.STAFF:
				return (
					requiredRoles.includes(Role.STAFF) ||
					requiredRoles.includes(Role.MEMBER)
				);
			case Role.MEMBER:
				return requiredRoles.includes(Role.MEMBER);
			default:
				throw new ForbiddenException('You do not have permission.');
		}
	}
}
