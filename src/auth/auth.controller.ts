import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "src/user/user.service";
import { Role } from "../shared/enum/role.enum";
import { CreateUserDto } from "../user/dtos/create-user.dto";
import { UserResponseDto } from "../user/dtos/user-response.dto";
import { AuthService } from "./auth.service";
import { AllowRole } from "./decorators/auth.decorator";
import { LoginDto } from "./dto/login.dto";
import { OpenAccountDto } from "./dto/open-account.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles/roles.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService
	) {}

	/*
	-------------------------------------------------------
	Open Account Endpoint
	-------------------------------------------------------
	*/

	@Post("openaccount")
	@ApiOperation({
		summary: "Create an account",
	})
	@ApiResponse({
		status: 201,
		description: "Account opened successfully.",
		schema: {
			example: {
				message: "Account opened successfully",
				user: {
					email: "example@gmail.com",
					house: "House1",
					key: "secret123",
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: "Bad Request - Invalid input data or email already exists",
	})
	async openAccount(@Query() query: OpenAccountDto) {
		return this.authService.openAccount(query);
	}

	/*
	-------------------------------------------------------
	Register Endpoint
	-------------------------------------------------------
	*/

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Register a new user" })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: "Create a new user",
		type: UserResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad Request." })
	async create(@Body() user: CreateUserDto): Promise<UserResponseDto> {
		const reponseUser = await this.userService.create(user);
		return reponseUser;
	}

	/*
	-------------------------------------------------------
	Login Endpoint
	-------------------------------------------------------
	*/
	@Post("login")
	@ApiOperation({
		summary: "User login",
		description: "Login with email and password",
	})
	@ApiResponse({
		status: 201,
		description: "login success",
		schema: {
			example: {
				token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
				user: {
					id: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
					email: "user@example.com",
					name: "user",
				},
			},
		},
	})
	@ApiResponse({
		status: 401,
		description: "Wrong email or password",
	})
	async login(@Body() logindata: LoginDto) {
		return this.authService.login(logindata);
	}

	/*
     -------------------------------------------------------
     Get Role Endpoint
     -------------------------------------------------------
     */
	@Get("role")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@ApiBearerAuth("access-token")
	@ApiOperation({ summary: "Get user role from token" })
	@ApiResponse({ status: 200, description: "Success" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	async getRole(@Request() req) {
		return { role: (await this.userService.findOne(req.user.userId)).role };
	}

	/*
	-------------------------------------------------------
	Test Endpoints (Protected)
	-------------------------------------------------------
	*/
	@Get("dev")
	@AllowRole(Role.DEV)
	@ApiResponse({ status: 200, description: "Success (DEV only)" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden (Requires DEV role)" })
	getstaffOnly() {
		return "You are dev!";
	}

	@Get("member")
	@AllowRole(Role.MEMBER)
	@ApiResponse({ status: 200, description: "Success (MEMBER only)" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden (Requires MEMBER role)" })
	getMenberOnly() {
		return "You are member!";
	}

	@Get("all")
	@AllowRole(Role.MEMBER, Role.DEV)
	@ApiResponse({ status: 200, description: "Success (MEMBER or DEV)" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden (Requires MEMBER or DEV role)" })
	getall() {
		return "everyone can see this (MEMBER or DEV)";
	}
}
