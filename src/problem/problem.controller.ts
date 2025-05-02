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
	Request,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { AllowRole } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/shared/enum/role.enum';
import { CreateProblemDto } from './dto/problem-create.dto';
import { ProblemService } from './problem.service';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import {
	ProblemPaginatedDto,
	ProblemResponseDto,
} from './dto/problem-respond.dto';
import { UpdateProblemDto } from './dto/problem-update.dto';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { ProblemQueryDto, ProblemUserQueryDto } from './dto/problem-query.dto';

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
	@AllowRole(Role.MEMBER)
	@ApiOkResponse({
		type: ProblemPaginatedDto,
	})
	@Get('search')
	async search(
		@Query() query: ProblemQueryDto,
		@Req() req: authenticatedRequest,
	): Promise<ProblemPaginatedDto> {
		return this.problemService.search(query, req.user);
	}

	@ApiOkResponse({ type: ProblemResponseDto })
	@AllowRole(Role.MEMBER)
	@Get(':id')
	async findOne(@Param('id') id: number): Promise<ProblemResponseDto> {
		return new ProblemResponseDto(await this.problemService.findOne(id));
	}

	@ApiOkResponse({ type: String })
	@AllowRole(Role.MEMBER)
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
