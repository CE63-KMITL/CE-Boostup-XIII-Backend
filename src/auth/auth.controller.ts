import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "src/user/user.service";
import { Role } from "../shared/enum/role.enum";
import { CreateUserDto } from "../user/dtos/create-user.dto";
import { UserResponseDto } from "../user/dtos/user-response.dto";
import { AuthService } from "./auth.service";
import { AllowRole } from "./decorators/auth.decorator";
import { LoginDto } from "./dto/login.dto";
import { OpenAccountDto } from "./dto/open-account.dto";

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
	Test Endpoints (Protected)
	-------------------------------------------------------
	*/
	@Get("dev")
	@AllowRole(Role.DEV)
	@ApiOperation({ summary: "Test endpoint for DEV role" })
	@ApiResponse({ status: 200, description: "Success (DEV only)" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden (Requires DEV role)" })
	getstaffOnly() {
		return "You are dev!";
	}

	@Get("member")
	@AllowRole(Role.MEMBER)
	@ApiOperation({ summary: "Test endpoint for MEMBER role" })
	@ApiResponse({ status: 200, description: "Success (MEMBER only)" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden (Requires MEMBER role)" })
	getMenberOnly() {
		return "You are member!";
	}

	@Get("all")
	@AllowRole(Role.MEMBER, Role.DEV)
	@ApiOperation({ summary: "Test endpoint for MEMBER or DEV roles" })
	@ApiResponse({ status: 200, description: "Success (MEMBER or DEV)" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden (Requires MEMBER or DEV role)" })
	getall() {
		return "everyone can see this (MEMBER or DEV)";
	}
}
