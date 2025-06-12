import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Request,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Role } from '../shared/enum/role.enum';
import { UpdateUserDto } from './dtos/update-user.dto';
import {
	UserFrontDataResponseDto,
	UserPaginatedDto,
	UserResponseDto,
	UserScoreDataResponseDto,
} from './dtos/user-response.dto';
import { ModifyScoreDto } from './score/dtos/modify-score.dto';
import { UserScoreResponseDto } from './score/dtos/score-response.dto';
import { UserService } from './user.service';
import { ProblemStatus } from './problem_status/problem-status.entity';

import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { UserQueryDto } from './dtos/user-query.dto';
import { UserSaveCodeDto } from './dtos/user-request.dto';
import { AllowRole } from 'src/shared/decorators/auth.decorator';
import { UploadIconDto } from './dtos/upload-icon.dto';
import { SetUserNameDto } from './dtos/set-user-name.dto';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../auth/auth.service';

@Controller('user')
@ApiTags('User')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
	) {}

	//-------------------------------------------------------
	// Public Endpoints
	//-------------------------------------------------------

	@Get()
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get all users',
		type: UserPaginatedDto,
	})
	@AllowRole(Role.DEV)
	async findAll(
		@Query() query: PaginationMetaDto,
	): Promise<UserPaginatedDto> {
		return await this.userService.findAll(query);
	}

	@Get('/search')
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'get user by query',
		type: UserPaginatedDto,
	})
	@AllowRole(Role.MEMBER)
	async search(@Query() query: UserQueryDto) {
		return await this.userService.search(query);
	}

	//-------------------------------------------------------
	// Protected Endpoints
	//-------------------------------------------------------

	@Get('data')
	@AllowRole(Role.DEV)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get user data for front-end server',
		type: UserFrontDataResponseDto,
	})
	async getData(
		@Query('user_token') userToken?: string,
	): Promise<UserFrontDataResponseDto> {
		if (userToken) {
			const targetUserPayload =
				await this.authService.validateUserTokenAndGetUser(
					userToken,
				);
			return await this.userService.getData(targetUserPayload.userId);
		}
		throw new BadRequestException(
			"'user_token' query parameter is required for this operation.",
		);
	}

	@Get('full-data/:id')
	@AllowRole(Role.MEMBER)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get a user getScoreData by id',
		type: UserScoreDataResponseDto,
	})
	async getScoreData(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
		@Request() req: authenticatedRequest,
	): Promise<UserScoreDataResponseDto> {
		if (req.user.role === Role.MEMBER && req.user.userId !== id)
			throw new ForbiddenException();
		return await this.userService.getScoreData(id);
	}

	@Get('score/:id')
	@AllowRole(Role.MEMBER)
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
		const user = await this.userService.findOne({ where: { id } });
		const scoreLogs = await this.userService.getUserScoreLogs(id);
		return new UserScoreResponseDto(user.score, scoreLogs);
	}

	@Post('score/add')
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get user score by id',
		type: UserResponseDto,
	})
	@AllowRole(Role.STAFF)
	async addScore(
		@Request() req: authenticatedRequest,
		@Body() modifyScoreDto: ModifyScoreDto,
	): Promise<UserResponseDto> {
		return this.userService.modifyScore(
			modifyScoreDto.userId,
			Math.abs(modifyScoreDto.amount),
			req.user.userId,
			modifyScoreDto.message,
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
		@Request() req: authenticatedRequest,
		@Body() modifyScoreDto: ModifyScoreDto,
	): Promise<UserResponseDto> {
		return this.userService.modifyScore(
			modifyScoreDto.userId,
			-Math.abs(modifyScoreDto.amount),
			req.user.userId,
			modifyScoreDto.message,
		);
	}

	@Patch('set-name')
	@AllowRole(Role.MEMBER)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Set user name',
		type: UserResponseDto,
	})
	@Throttle({
		default: {
			ttl: 60 * 1000,
			limit: 1,
		},
	})
	async setName(
		@Request() req: authenticatedRequest,
		@Body() body: SetUserNameDto,
	): Promise<UserResponseDto> {
		return await this.userService.update(req.user.userId, {
			name: body.name,
		});
	}

	@Patch(':id')
	@AllowRole(Role.DEV)
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
	@AllowRole(Role.DEV)
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

	//-------------------------------------------------------
	// Problem Status Endpoints
	//-------------------------------------------------------

	@Get('problem-status/:problemId')
	@AllowRole(Role.MEMBER)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get problem status for a user and problem ID',
		type: ProblemStatus,
	})
	async getProblemStatus(
		@Request() req: authenticatedRequest,
		@Param('problemId', ParseIntPipe) problemId: number,
	): Promise<ProblemStatus> {
		return await this.userService.findOneProblemStatus(
			req.user.userId,
			problemId,
			true,
		);
	}

	//-------------------------------------------------------
	// Problem Code Endpoints
	//-------------------------------------------------------

	@Get('code/:problemId')
	@AllowRole(Role.MEMBER)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get saved code for a problem',
		type: String,
	})
	async getCode(
		@Request() req: authenticatedRequest,
		@Param('problemId', ParseIntPipe) problemId: number,
	): Promise<string | null> {
		return await this.userService.getCode(req.user.userId, problemId);
	}

	@Post('code/:problemId')
	@AllowRole(Role.MEMBER)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Save code for a problem',
	})
	async saveCode(
		@Request() req: authenticatedRequest,
		@Param('problemId', ParseIntPipe) problemId: number,
		@Body() saveCodeDto: UserSaveCodeDto,
	) {
		return await this.userService.saveCode(
			req.user.userId,
			problemId,
			saveCodeDto.code,
		);
	}

	//-------------------------------------------------------
	// File Upload Endpoints
	//-------------------------------------------------------

	@Post('upload-icon')
	@AllowRole(Role.MEMBER)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'successfully upload icon base64 string',
	})
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				iconBase64: {
					type: 'string',
				},
			},
		},
	})
	@Throttle({
		default: {
			ttl: 60 * 1000,
			limit: 1,
		},
	})
	async uploadIcon(
		@Request() req: authenticatedRequest,
		@Body() body: UploadIconDto,
	): Promise<void> {
		this.userService.uploadIcon(req.user.userId, body.iconBase64);
	}
}
