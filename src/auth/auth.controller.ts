import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Request, UseGuards } from "@nestjs/common";
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
	Public Endpoints
	-------------------------------------------------------
	*/

	@Post("openaccount")
	async openAccount(@Query() query: OpenAccountDto) {
		return this.authService.openAccount(query);
	}

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: "Create a new user",
		type: UserResponseDto,
	})
	async create(@Body() user: CreateUserDto): Promise<UserResponseDto> {
		const reponseUser = await this.userService.create(user);
		return reponseUser;
	}

	@Post("login")
	@ApiOperation({
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

	@UseGuards(JwtAuthGuard)
	@Get("role")
	@ApiOperation({
		description: "Get user role from token",
	})
	@ApiResponse({
		status: 200,
		description: "Return user role",
		schema: {
			example: {
				role: "MEMBER",
			},
		},
	})
	getRole(@Request() req) {
		return req.user.role;
	}

	/*
	-------------------------------------------------------
	Test Endpoints (Protected)
	-------------------------------------------------------
	*/

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.DEV)
	@Get("dev")
	getDevOnly() {
		return "You are dev!";
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.MEMBER)
	@Get("member")
	getMemberOnly() {
		return "You are member!";
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.MEMBER, Role.DEV)
	@Get("all")
	getAllRoles() {
		return "everyone can see this (except staff)";
	}
}
