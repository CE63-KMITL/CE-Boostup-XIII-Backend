import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Request,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { Role } from '../shared/enum/role.enum';
import { AuthService } from './auth.service';
import { AllowRole } from './decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';
import { OpenAccountDto } from './dto/open-account.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles/roles.guard';
import { authenticatedRequest } from './interfaces/authenticated-request.interface';
import { loginResponseDto } from './dto/login-response.dto';
import { RegisterUserDto } from './dto/register-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
	) {}

	/*
	-------------------------------------------------------
	Open Account Endpoint
	-------------------------------------------------------
	*/

	@Patch('open-account')
	@ApiOperation({
		summary: 'Create an account',
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Account opened successfully.',
	})
	@ApiResponse({
		status: 400,
		description:
			'Bad Request - Invalid input data or email already exists',
	})
	@HttpCode(HttpStatus.NO_CONTENT)
	async openAccount(@Body() body: OpenAccountDto): Promise<void> {
		await this.authService.openAccount(body);
	}

	@Post('request-open-account')
	@ApiBody({
		description: 'email',
		schema: {
			example: {
				email: 'example@gmail.com',
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'mail send',
	})
	@HttpCode(HttpStatus.NO_CONTENT)
	async requestOpenAccount(@Body() body: { email: string }): Promise<void> {
		await this.authService.requestOpenAccount(body.email);
	}

	/*
	-------------------------------------------------------
	Register Endpoint
	-------------------------------------------------------
	*/

	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: 'Register a new user' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Registeration successfull',
	})
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	async create(@Body() user: RegisterUserDto): Promise<{ message: string }> {
		await this.authService.register(user);
		return { message: 'Registeration successfull' };
	}

	/*
	-------------------------------------------------------
	Login Endpoint
	-------------------------------------------------------
	*/
	@Post('login')
	@ApiOperation({
		summary: 'User login',
		description: 'Login with email and password',
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'login success',
		type: loginResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Wrong email or password',
	})
	@HttpCode(HttpStatus.OK)
	async login(@Body() logindata: LoginDto): Promise<loginResponseDto> {
		return this.authService.login(logindata);
	}

	/*
     -------------------------------------------------------
     Get Role Endpoint
     -------------------------------------------------------
     */
	@Get('role')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@ApiBearerAuth('access-token')
	@ApiOperation({ summary: 'Get user role from token' })
	@ApiResponse({ status: 200, description: 'Success' })
	@ApiResponse({ status: 401, description: 'Unauthorized' })
	async getRole(@Request() req: authenticatedRequest) {
		return {
			role: (await this.userService.findOne(req.user.userId)).role,
		};
	}

	/*
	-------------------------------------------------------
	Test Endpoints (Protected)
	-------------------------------------------------------
	*/
	@Get('dev')
	@AllowRole(Role.DEV)
	@ApiResponse({ status: 200, description: 'Success (DEV only)' })
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
