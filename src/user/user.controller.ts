import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Request,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllowRole } from '../auth/decorators/auth.decorator';
import { Role } from '../shared/enum/role.enum';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { ModifyScoreDto } from './score/dtos/modify-score.dto';
import { UserScoreResponseDto } from './score/dtos/score-response.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('User')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/*
	-------------------------------------------------------
	Get All Users
	-------------------------------------------------------
	*/
	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get all users',
		type: UserResponseDto,
		isArray: true,
	})
	@AllowRole(Role.DEV)
	async findAll(): Promise<UserResponseDto[]> {
		return await this.userService.findAll();
	}

	/*
	-------------------------------------------------------
	Protected Endpoints
	-------------------------------------------------------
	*/

	// @Post()
	// @HttpCode(HttpStatus.CREATED)
	// @ApiResponse({
	// 	status: HttpStatus.CREATED,
	// 	description: "Create a new user",
	// 	type: UserResponseDto,
	// })
	// async create(@Body() user: CreateUserDto): Promise<UserResponseDto> {
	// 	const reponseUser = await this.userService.create(user);
	// 	return reponseUser;
	// }

	@Get(':id')
	@HttpCode(HttpStatus.OK)
	@AllowRole(Role.MEMBER)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get a user by id',
		type: UserResponseDto,
	})
	async findOne(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
	): Promise<UserResponseDto> {
		const user = await this.userService.findOne(id);
		return new UserResponseDto(user);
	}

	@Get('score/:id')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get user score by id',
		type: UserScoreResponseDto,
	})
	async getScore(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
	): Promise<UserScoreResponseDto> {
		const user = await this.userService.findOne(id);
		const scoreLogs = await this.userService.getUserScoreLogs(id);
		const json = { score: user.score, scoreLogs: scoreLogs };
		return json;
	}

	@Post('score/add')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get user score by id',
		type: UserResponseDto,
	})
	@AllowRole(Role.STAFF)
	async addScore(
		@Request() req,
		@Body() modifyScoreDto: ModifyScoreDto,
	): Promise<UserResponseDto> {
		console.log(req);
		return this.userService.modifyScore(
			modifyScoreDto.userId,
			Math.abs(modifyScoreDto.amount),
			req.user.userId,
		);
	}

	@Post('score/subtract')
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get user score by id',
		type: UserResponseDto,
	})
	@AllowRole(Role.STAFF)
	async subtractScore(
		@Request() req,
		@Body() modifyScoreDto: ModifyScoreDto,
	): Promise<UserResponseDto> {
		return this.userService.modifyScore(
			modifyScoreDto.userId,
			-Math.abs(modifyScoreDto.amount),
			req.user.userId,
		);
	}

	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Update a user by id',
		type: UserResponseDto,
	})
	async update(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
		@Body() user: UpdateUserDto,
	): Promise<UserResponseDto> {
		const responseUser = await this.userService.update(id, user);
		return responseUser;
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'Delete a user by id',
	})
	async delete(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
	): Promise<void> {
		await this.userService.delete(id);
	}

	@AllowRole(Role.MEMBER)
	@Post('setProblemStatus/:id')
	async tryProblem(@Request() req, @Param('id') id: number) {
		return this.userService.setProblemStatus(id, req.user.userId);
	}
}
