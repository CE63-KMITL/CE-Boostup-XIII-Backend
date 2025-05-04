import {
	Controller,
	Post,
	HttpCode,
	HttpStatus,
	Body,
	Get,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/shared/enum/role.enum';
import { AuthService } from './auth.service';
import { AllowRole } from './decorators/auth.decorator';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';

@ApiTags('Auth (DEV)')
@Controller('dev/auth/')
export class DevAuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
	) {}

	@Post('create-user')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Create user' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'User created successfully',
	})
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	@AllowRole(Role.DEV)
	async createUser(
		@Body() body: CreateUserDto,
	): Promise<{ message: string }> {
		await this.userService.create(body);
		return { message: 'User created successfully' };
	}
	/*
	-------------------------------------------------------
	Set Password Endpoint
	-------------------------------------------------------
	*/
	@Post('set-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Set password for a registered user' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Password set successfully',
	})
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	@AllowRole(Role.DEV)
	async setPassword(
		@Body() body: { email: string; password: string },
	): Promise<{ message: string }> {
		await this.authService.setPassword(body.email, body.password);
		return { message: 'Password set successfully' };
	}

	/*
	-------------------------------------------------------
	Set Role Endpoint
	-------------------------------------------------------
	*/
	@Post('set-role')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Set role for a user' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Role set successfully',
	})
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	@AllowRole(Role.DEV)
	async setRole(
		@Body() body: { email: string; role: Role },
	): Promise<{ message: string }> {
		await this.authService.setRole(body.email, body.role);
		return { message: 'Role set successfully' };
	}

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
