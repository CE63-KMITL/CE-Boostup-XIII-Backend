import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseFilePipeBuilder,
	ParseIntPipe,
	ParseUUIDPipe,
	Patch,
	Post,
	
	Query,
	Request,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';

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

import { FileInterceptor } from '@nestjs/platform-express';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { UserQueryDto } from './dtos/user-query.dto';
import { UserSaveCodeDto } from './dtos/user-request.dto';
import { AllowRole } from 'src/shared/decorators/auth.decorator';

@Controller('user')
@ApiTags('User')
export class UserController {
	constructor(private readonly userService: UserService) {}

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
	@AllowRole(Role.MEMBER)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Get user data for front-end server',
		type: UserFrontDataResponseDto,
	})
	async getData(
		@Request() req: authenticatedRequest,
	): Promise<UserFrontDataResponseDto> {
		return await this.userService.getData(req.user.userId);
	}

	@Get(':id')
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
		const json = { score: user.score, scoreLogs: scoreLogs };
		return json;
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

	@Patch(':id')
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
	async tryProblem(
		@Request() req: authenticatedRequest,
		@Param('id') id: number,
	) {
		return this.userService.setProblemStatus(id, req.user.userId);
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
	@AllowRole(Role.MEMBER, Role.DEV)
	@UseInterceptors(FileInterceptor('file'))
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
		description: 'successfully upload file',
	})
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiConsumes('multipart/form-data')
	async uploadIcon(
		@Request() req: authenticatedRequest,
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({
					fileType: 'image/*',
				})
				.addMaxSizeValidator({
					maxSize: 100 * 1024, // limite file size = 100kb
				})
				.build({
					fileIsRequired: true,
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		file: Express.Multer.File,
	): Promise<void> {
		const iconBase64 = file.buffer.toString('base64');
		this.userService.uploadIcon(req.user.userId, iconBase64);
	}
}
