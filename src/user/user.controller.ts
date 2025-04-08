import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpStatus,
  Patch,
  Delete,
  HttpCode,
  UseGuards
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { UserResponseDto } from "./dtos/user-response.dto";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { ModifyScoreDto } from "./score/dtos/modify-score.dto";
import { UserScoreResponseDto } from "./score/dtos/score-response.dto";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard'
import {Roles} from '../auth/roles/roles.decorator'
import { Role } from '../shared/enum/role.enum'; 
@Controller("user")
@ApiTags("User")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Get all users",
		type: UserResponseDto,
		isArray: true,
	})
	async findAll(): Promise<UserResponseDto[]> {
		return await this.userService.findAll();
	}
	@Post()
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
	@Get(":id")
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Get a user by id",
		type: UserResponseDto,
	})
	async findOne(
		@Param(
			"id",
			new ParseUUIDPipe({
				version: "4",
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			})
		)
		id: string
	): Promise<UserResponseDto> {
		const user = await this.userService.findOne(id);
		return user;
	}

	@Get("score/:id")
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Get user score by id",
		type: UserScoreResponseDto,
	})
	async get_score(
		@Param(
			"id",
			new ParseUUIDPipe({
				version: "4",
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			})
		)
		id: string
	): Promise<UserScoreResponseDto> {
		const user = await this.userService.findOne(id);
		const score_logs = await this.userService.getuser_scorelogs(id);
		const json = { score: user.score, scoreLogs: score_logs };
		return json;
	}

	@Post("score/add")
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Get user score by id",
		type: UserResponseDto,
	})
	async addScore(@Body() modifyScoreDto: ModifyScoreDto): Promise<UserResponseDto> {
		const modifiedBy = await this.userService.findEntityById(modifyScoreDto.modifiedById);

		return this.userService.modifyScore(modifyScoreDto.userId, Math.abs(modifyScoreDto.amount), modifiedBy.id);
	}

	@Post("score/subtract")
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Get user score by id",
		type: UserResponseDto,
	})
	async subtractScore(@Body() modifyScoreDto: ModifyScoreDto): Promise<UserResponseDto> {
		const modifiedBy = await this.userService.findEntityById(modifyScoreDto.modifiedById);
		return this.userService.modifyScore(modifyScoreDto.userId, -Math.abs(modifyScoreDto.amount), modifiedBy.id);
	}

	@Patch(":id")
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Update a user by id",
		type: UserResponseDto,
	})
	async update(
		@Param(
			"id",
			new ParseUUIDPipe({
				version: "4",
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			})
		)
		id: string,
		@Body() user: UpdateUserDto
	): Promise<UserResponseDto> {
		const responseUser = await this.userService.update(id, user);
		return responseUser;
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: "Delete a user by id",
	})
	async delete(
		@Param(
			"id",
			new ParseUUIDPipe({
				version: "4",
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			})
		)
		id: string
	): Promise<void> {
		await this.userService.delete(id);
	}
}
