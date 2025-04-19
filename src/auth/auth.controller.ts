import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserService } from "src/user/user.service";
import { Role } from "../shared/enum/role.enum";
import { CreateUserDto } from "../user/dtos/create-user.dto";
import { UserResponseDto } from "../user/dtos/user-response.dto";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { OpenAccountDto } from "./dto/open-account.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Roles } from "./roles/roles.decorator";
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
	@ApiOperation({ summary: "Open a new bank account (placeholder)" })
	@ApiResponse({ status: 201, description: "Account opened successfully." })
	@ApiResponse({ status: 400, description: "Bad Request." })
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
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.DEV)
	@Get("dev")
	@ApiOperation({ summary: "Test endpoint for DEV role" })
	@ApiResponse({ status: 200, description: "Success (DEV only)" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden (Requires DEV role)" })
	getAdminOnly() {
		return "You are dev!";
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.MEMBER)
	@Get("member")
	@ApiOperation({ summary: "Test endpoint for MEMBER role" })
	@ApiResponse({ status: 200, description: "Success (MEMBER only)" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden (Requires MEMBER role)" })
	getMenberOnly() {
		return "You are member!";
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.MEMBER, Role.DEV)
	@Get("all")
	@ApiOperation({ summary: "Test endpoint for MEMBER or DEV roles" })
	@ApiResponse({ status: 200, description: "Success (MEMBER or DEV)" })
	@ApiResponse({ status: 401, description: "Unauthorized" })
	@ApiResponse({ status: 403, description: "Forbidden (Requires MEMBER or DEV role)" })
	getall() {
		return "everyone can see this (MEMBER or DEV)";
	}
}
