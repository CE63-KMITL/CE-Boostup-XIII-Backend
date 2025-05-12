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
import {
	ApiCreatedResponse,
	ApiOkResponse,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Role } from 'src/shared/enum/role.enum';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { CreateProblemDto } from './dto/problem-create.dto';
import {
	ProblemPaginatedDto,
	ProblemResponseDto,
	ProblemSearchedPaginatedDto,
} from './dto/problem-respond.dto';
import { ProblemService } from './problem.service';
import { ProblemSubmissionDto } from './dto/code-submission-dto/problem-submission.dto';
import { ProblemSubmissionResponseDto } from './dto/code-submission-dto/problem-submission-response.dto';
import { RejectProblemDTO } from './dto/problem-reject.dto';
import { ProblemRunCodeRequest } from './dto/problem-request.dto';
import { RunCodeResponseDto } from 'src/run_code/dtos/run-code-response.dto';
import { Throttle } from '@nestjs/throttler';
import { THROTTLE_RUNCODE } from 'src/shared/configs/throttle.config';
import { UpdateProblemDto } from './dto/problem-update.dto';
import { ProblemSearchQueryDto } from './dto/problem-query.dto';
import { AllowRole } from 'src/shared/decorators/auth.decorator';

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
	@Get(':id')
	async findOne(@Param('id') id: number): Promise<ProblemResponseDto> {
		return new ProblemResponseDto(await this.problemService.findOne(id));
	}

	@ApiOkResponse({ type: String })
	@Get('detail/:id')
	async getDetail(@Param('id') id: number) {
		return this.problemService.getDetail(id);
	}

	//-------------------------------------------------------
	// Code Execution
	//-------------------------------------------------------
	@Post('run-code/:id')
	@Throttle({
		default: THROTTLE_RUNCODE,
	})
	async runCode(
		@Param('id', ParseIntPipe) id: number,
		@Req() req: authenticatedRequest,
		@Body() body: ProblemRunCodeRequest,
	) {
		return new RunCodeResponseDto(
			await this.problemService.runCode(
				id,
				req.user.userId,
				body.input,
			),
		);
	}

	@AllowRole(Role.MEMBER)
	@Post('submission/:problemId')
	@ApiResponse({ type: ProblemSubmissionResponseDto, isArray: true })
	@Throttle({
		default: THROTTLE_RUNCODE,
	})
	async submission(
		@Param(
			'problemId',
			new ParseIntPipe({
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		problemId: number,
		@Req() req: authenticatedRequest,
		@Body() problemSubmission: ProblemSubmissionDto,
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
