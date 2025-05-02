import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiTags,
} from '@nestjs/swagger';
import { AllowRole } from 'src/auth/decorators/auth.decorator';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Role } from 'src/shared/enum/role.enum';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { CreateProblemDto } from './dto/problem-create.dto';
import { ProblemQueryDto } from './dto/problem-query.dto';
import {
	ProblemPaginatedDto,
	ProblemResponseDto,
} from './dto/problem-respond.dto';
import { UpdateProblemDto } from './dto/problem-update.dto';
import { ProblemService } from './problem.service';

@Controller('problem')
@ApiTags('Problem')
export class ProblemController {
	constructor(private readonly problemService: ProblemService) {}

	@ApiCreatedResponse({ type: ProblemResponseDto })
	@AllowRole(Role.STAFF)
	@Post()
	async create(
		@Body() createProblemRequest: CreateProblemDto,
		@Req() req: authenticatedRequest,
	): Promise<ProblemResponseDto> {
		const userId = req.user.userId;
		return new ProblemResponseDto(
			await this.problemService.create(createProblemRequest, userId),
		);
	}

	@ApiOkResponse({
		type: ProblemPaginatedDto,
	})
	@AllowRole(Role.DEV)
	@Get()
	async findAll(
		@Query() query: PaginationMetaDto,
	): Promise<ProblemPaginatedDto> {
		return this.problemService.findAll(query);
	}

	/*
	-------------------------------------------------------
	Search Problems
	-------------------------------------------------------
	*/
	@ApiOkResponse({
		type: ProblemPaginatedDto,
	})
	@AllowRole()
	@Get('search')
	async search(
		@Query() query: ProblemQueryDto,
		@Req() req: authenticatedRequest,
	): Promise<ProblemPaginatedDto> {
		return this.problemService.search(query, req.user);
	}

	// @AllowRole(Role.MEMBER)
	// @ApiResponse({
	// 	type: ProblemPaginatedDto,
	// 	description: 'get problem by user id and search by status',
	// })
	// @Get('user')
	// async getProblemsByUserId(
	// 	@Request() req: authenticatedRequest,
	// 	@Query() query: ProblemUserQueryDto,
	// ): Promise<ProblemPaginatedDto> {
	// 	return await this.problemService.getProblemsByUserId(
	// 		req.user.userId,
	// 		query,
	// 	);
	// }

	@ApiOkResponse({ type: ProblemResponseDto })
	@AllowRole(Role.MEMBER)
	@Get(':id')
	async findOne(@Param('id') id: number): Promise<ProblemResponseDto> {
		return new ProblemResponseDto(await this.problemService.findOne(id));
	}

	@ApiOkResponse({ type: String })
	@Get('detail/:id')
	async getDetail(@Param('id') id: number) {
		return this.problemService.getDetail(id);
	}

	@ApiOkResponse({ type: ProblemResponseDto })
	@AllowRole(Role.STAFF)
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateProblemRequest: UpdateProblemDto,
	): Promise<ProblemResponseDto> {
		return new ProblemResponseDto(
			await this.problemService.update(id, updateProblemRequest),
		);
	}

	@ApiNoContentResponse({
		description: 'delete problem',
	})
	@AllowRole(Role.DEV)
	@Delete(':id')
	async remove(@Param('id', ParseIntPipe) id: number) {
		this.problemService.remove(id);
	}
}
