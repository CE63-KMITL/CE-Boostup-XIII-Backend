import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/shared/enum/role.enum';
import { AllowRole } from '../decorators/auth.decorator';

@ApiTags('Auth (DEV)')
@Controller('dev/auth/')
export class DevAuthController {
	/*
	-------------------------------------------------------
	Test Roles Endpoint
	-------------------------------------------------------
	*/
	@Get('roles')
	@AllowRole(Role.DEV)
	@ApiResponse({ status: 200, description: 'Success' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden (Requires DEV role)' })
	getRoles() {
		return 'You are dev!';
	}

	@Get('dev')
	@AllowRole(Role.DEV)
	@ApiResponse({ status: 200, description: 'Success' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({ status: 403, description: 'Forbidden (Requires DEV role)' })
	getstaffOnly() {
		return 'You are dev!';
	}

	@Get('member')
	@AllowRole(Role.MEMBER)
	@ApiResponse({ status: 200, description: 'Success (MEMBER only)' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden (Requires MEMBER role)',
	})
	getMenberOnly() {
		return 'You are member!';
	}

	@Get('all')
	@AllowRole(Role.MEMBER, Role.DEV)
	@ApiResponse({ status: 200, description: 'Success (MEMBER or DEV)' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	@ApiResponse({
		status: 403,
		description: 'Forbidden (Requires MEMBER or DEV role)',
	})
	getall() {
		return 'everyone can see this (MEMBER or DEV)';
	}
}
