import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
} from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { AllowRole } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/shared/enum/role.enum';
import {
	CreateProblemDto,
	ProblemSearchRequest,
} from './dto/problem-create.dto';
import { Problem } from './problem.entity';
import { ProblemService } from './problem.service';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import {
	ProblemPaginatedDto,
	ProblemResponseDto,
} from './dto/problem-respond.dto';
import { UpdateProblemDto } from './dto/problem-update.dto';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';

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
		@Query() query: PaginationMetaDto<Problem>,
	): Promise<ProblemPaginatedDto> {
		return this.problemService.findAll(query);
	}

	/*
	-------------------------------------------------------
	Search Problems
	-------------------------------------------------------
	*/
	@ApiOkResponse({
		schema: {
			properties: {
				items: {
					type: 'array',
					items: { $ref: '#/components/schemas/Problem' },
				},
				pageCount: {
					type: 'number',
					description: 'Total number of pages',
				},
			},
		},
	})
	@ApiQuery({
		name: 'searchText',
		required: false,
		description: 'Search by ID or author name or problem name',
	})
	@ApiQuery({
		name: 'idReverse',
		required: false,
		type: 'boolean',
		description: 'Sort by ID in reverse order',
	})
	@ApiQuery({
		name: 'tag',
		required: false,
		isArray: true,
		description: 'Filter by tags',
	})
	@ApiQuery({
		name: 'difficulty',
		required: false,
		type: 'number',
		description: 'Filter by difficulty level (0.5-5)',
	})
	@ApiQuery({
		name: 'page',
		required: false,
		type: 'number',
		description: 'Page number (starts from 1)',
	})
	@ApiQuery({
		name: 'staff',
		required: false,
		type: 'boolean',
		description: 'For staff',
	})
	@Get('search')
	async search(@Query() query: ProblemSearchRequest, @Req() req) {
		return this.problemService.search(query, req.user);
	}

	@ApiOkResponse({ type: ProblemResponseDto })
	@AllowRole(Role.MEMBER)
	@Get(':id')
	async findOne(@Param('id') id: string): Promise<ProblemResponseDto> {
		return new ProblemResponseDto(await this.problemService.findOne(id));
	}

	@ApiOkResponse({ type: String })
	@Get('detail/:id')
	async getDetail(@Param('id') id: string) {
		return this.problemService.getDetail(id);
	}

	@ApiOkResponse({ type: ProblemResponseDto })
	@AllowRole(Role.STAFF)
	@Patch(':id')
	async update(
		@Param('id') id: string,
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
	async remove(@Param('id') id: string) {
		this.problemService.remove(id);
	}
}
