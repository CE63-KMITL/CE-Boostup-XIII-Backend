import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseFilePipeBuilder,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Request,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AllowRole } from '../auth/decorators/auth.decorator';
import { Role } from '../shared/enum/role.enum';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserPaginatedDto, UserResponseDto } from './dtos/user-response.dto';
import { ModifyScoreDto } from './score/dtos/modify-score.dto';
import { UserScoreResponseDto } from './score/dtos/score-response.dto';
import { UserService } from './user.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { UserQueryDto } from './dtos/user-query.dto';

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
		type: UserPaginatedDto,
	})
	@AllowRole(Role.DEV)
	async findAll(
		@Query() query: PaginationMetaDto,
	): Promise<UserPaginatedDto> {
		return await this.userService.findAll(query);
	}

	@Get('/search')
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'get user by query',
	})
	@AllowRole(Role.MEMBER)
	async search(@Query() query: UserQueryDto) {
		await this.userService.search(query);
	}

	/*
	-------------------------------------------------------
	Protected Endpoints
	-------------------------------------------------------
	*/

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
		const user = await this.userService.findOne({ where: { id } });
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
		const user = await this.userService.findOne({ where: { id } });
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
		@Request() req: authenticatedRequest,
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
		@Request() req: authenticatedRequest,
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
	async tryProblem(
		@Request() req: authenticatedRequest,
		@Param('id') id: number,
	) {
		return this.userService.setProblemStatus(id, req.user.userId);
	}

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
