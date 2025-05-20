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
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { OpenAccountDto, RequestEmailDto } from './dtos/open-account.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { authenticatedRequest } from './interfaces/authenticated-request.interface';
import { AuthResponseDto } from './dtos/auth-response.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { Throttle } from '@nestjs/throttler';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { Role } from 'src/shared/enum/role.enum';
import { AllowRole } from 'src/shared/decorators/auth.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/*
	-------------------------------------------------------
	Open Account Endpoint
	-------------------------------------------------------
	*/
	@Post('request-open-account')
	@ApiBody({
		description: 'email',
		type: RequestEmailDto,
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'mail send',
	})
	@HttpCode(HttpStatus.NO_CONTENT)
	async requestOpenAccount(@Body() body: RequestEmailDto): Promise<void> {
		await this.authService.requestOpenAccount(body.email);
	}

	@Patch('open-account')
	@ApiOperation({
		summary: 'Activate an account',
	})
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Account opened successfully.',
		type: AuthResponseDto,
	})
	@ApiResponse({
		status: 400,
		description:
			'Bad Request - Invalid input data or email already exists',
	})
	@HttpCode(HttpStatus.CREATED)
	async openAccount(@Body() body: OpenAccountDto): Promise<AuthResponseDto> {
		return await this.authService.openAccount(body);
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
	@AllowRole(Role.DEV)
	async register(
		@Body() user: RegisterUserDto,
	): Promise<{ message: string }> {
		await this.authService.register(user);
		return { message: 'Registeration successfull' };
	}

	@Post('register-open-account')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Registeration successfull',
	})
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	async registerOpenAccount(@Body() user: RequestEmailDto): Promise<void> {
		await this.authService.registerOpenAccount(user);
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
		type: AuthResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Wrong email or password',
	})
	async login(@Body() logindata: LoginDto): Promise<AuthResponseDto> {
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
	@ApiResponse({ status: HttpStatus.OK, description: 'Success' })
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: 'Unauthorized',
	})
	async getRole(@Request() req: authenticatedRequest) {
		return {
			role: req.user.role,
		};
	}

	/*
     -------------------------------------------------------
     Reset Password Endpoint
     -------------------------------------------------------
     */
	@Post('request-reset-password')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiBody({
		description: 'email',
		type: RequestEmailDto,
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'mail send',
	})
	async requestResetPassword(@Body() body: RequestEmailDto) {
		await this.authService.requestResetPassword(body);
	}

	@Patch('reset-password')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiBody({
		description: 'Reset password',
		type: ResetPasswordDto,
	})
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Password reset successfully',
	})
	async resetPasswordConfirm(@Body() body: ResetPasswordDto) {
		await this.authService.resetPassword(body);
	}
}
