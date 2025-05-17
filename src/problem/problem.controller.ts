import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiOkResponse,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Role } from 'src/shared/enum/role.enum';
import { ProblemPublishedGuard } from './guards/problem-published.guard';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { CreateProblemDto } from './dtos/problem-create.dto';
import {
	ProblemCodeResponseDto,
	ProblemPaginatedDto,
	ProblemResponseDto,
	ProblemSearchedPaginatedDto,
} from './dtos/problem-response.dto';
import { ProblemService } from './problem.service';
import { ProblemRequestSubmissionDto } from './dtos/code-submission-dto/problem-submission.dto';
import { ProblemSubmissionResponseDto } from './dtos/code-submission-dto/problem-submission-response.dto';
import { RejectProblemDTO } from './dtos/problem-reject.dto';
import { ProblemRunCodeRequest } from './dtos/problem-request.dto';
import { RunCodeResponseDto } from 'src/run_code/dtos/run-code-response.dto';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_RUNCODE } from 'src/shared/configs/throttle.config';
import { UpdateProblemDto } from './dtos/problem-update.dto';
import { ProblemSearchQueryDto } from './dtos/problem-query.dto';
import { AllowRole } from 'src/shared/decorators/auth.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('problem')
@ApiTags('Problem')
export class ProblemController {
	constructor(private readonly problemService: ProblemService) {}

	//-------------------------------------------------------
	// Problem Management
	//-------------------------------------------------------
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

	@ApiOkResponse({ type: ProblemResponseDto })
	@AllowRole(Role.STAFF)
	@Patch(':id')
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateProblemRequest: UpdateProblemDto,
		@Req() req: authenticatedRequest,
	): Promise<ProblemResponseDto> {
		return new ProblemResponseDto(
			await this.problemService.update(
				id,
				updateProblemRequest,
				req.user,
			),
		);
	}

	//-------------------------------------------------------
	// Problem Search
	//-------------------------------------------------------
	@ApiOkResponse({
		type: ProblemSearchedPaginatedDto,
	})
	@AllowRole()
	@Get('search')
	async search(
		@Query() query: ProblemSearchQueryDto,
		@Req() req: authenticatedRequest,
	): Promise<ProblemSearchedPaginatedDto> {
		return this.problemService.search(query, req.user);
	}

	//-------------------------------------------------------
	// Problem Data
	//-------------------------------------------------------

	@ApiOkResponse({ type: ProblemResponseDto })
	@AllowRole(Role.MEMBER)
	@UseGuards(JwtAuthGuard, ProblemPublishedGuard)
	@Get(':id')
	async findOne(
		@Param('id') id: number,
		@Req() req: authenticatedRequest,
	): Promise<ProblemResponseDto> {
		const problem = await this.problemService.findOne(id);
		return new ProblemResponseDto(problem);
	}

	@ApiOkResponse({ type: ProblemResponseDto })
	@AllowRole(Role.MEMBER)
	@UseGuards(JwtAuthGuard, ProblemPublishedGuard)
	@Get('code/:id')
	async code(@Param('id') id: number): Promise<ProblemCodeResponseDto> {
		const problem = await this.problemService.findOne(id);
		return new ProblemCodeResponseDto(problem);
	}

	@ApiOkResponse({ type: String })
	@AllowRole(Role.MEMBER)
	@UseGuards(JwtAuthGuard, ProblemPublishedGuard)
	@Get('detail/:id')
	async getDetail(@Param('id') id: number) {
		const problem = await this.problemService.findOne(id);
		return problem.description || 'No detail available';
	}

	//-------------------------------------------------------
	// Code Execution
	//-------------------------------------------------------
	@Post('run-code/:id')
	@Throttle({
		default: THROTTLE_RUNCODE,
	})
	@AllowRole(Role.MEMBER)
	@UseGuards(JwtAuthGuard, ProblemPublishedGuard)
	async runCode(
		@Param('id', ParseIntPipe) id: number,
		@Body() body: ProblemRunCodeRequest,
	) {
		return new RunCodeResponseDto(
			await this.problemService.runCode(id, body.input, body.code),
		);
	}

	@AllowRole(Role.MEMBER)
	@Post('submission/:problemId')
	@ApiResponse({ type: ProblemSubmissionResponseDto, isArray: true })
	@Throttle({
		default: THROTTLE_RUNCODE,
	})
	@UseGuards(JwtAuthGuard, ProblemPublishedGuard)
	async submission(
		@Param(
			'problemId',
			new ParseIntPipe({
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		problemId: number,
		@Req() req: authenticatedRequest,
		@Body() problemSubmission: ProblemRequestSubmissionDto,
	): Promise<ProblemSubmissionResponseDto[]> {
		return await this.problemService.submission(
			problemSubmission,
			req.user.userId,
			problemId,
		);
	}

	//-------------------------------------------------------
	// Problem Review/Approval
	//-------------------------------------------------------
	@ApiResponse({ status: HttpStatus.OK })
	@AllowRole(Role.STAFF)
	@Post('review/:id')
	async requestReviewProblem(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: authenticatedRequest,
	) {
		return await this.problemService.requestReviewProblem(id, req.user);
	}

	@AllowRole(Role.STAFF)
	@Post('approve/:id')
	async approve(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: authenticatedRequest,
	) {
		return await this.problemService.approve(id, req.user);
	}

	@AllowRole(Role.STAFF)
	@Post('reject/:id')
	async rejectProblem(
		@Param('id', ParseIntPipe) id: number,
		@Body() message: RejectProblemDTO,
		@Req() req: authenticatedRequest,
	) {
		return await this.problemService.rejectProblem(id, message, req.user);
	}

	@AllowRole(Role.STAFF)
	@Post('archive/:id')
	async archiveProblem(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: authenticatedRequest,
	) {
		return await this.problemService.archiveProblem(id, req.user);
	}
}
