import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	ParseUUIDPipe,
	HttpStatus,
	ParseIntPipe,
	Request,
	HttpCode,
} from '@nestjs/common';
import { TestCaseService } from './test-case.service';
import {
	CreateTestCaseDto,
	UpdateTestCaseDto,
} from './dto/create-test-case.dto';
import { AllowRole } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/shared/enum/role.enum';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { TestCaseResponseDto } from './dto/test-case-response.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('test-case')
export class TestCaseController {
	constructor(private readonly testCaseService: TestCaseService) {}

	@Post(':problemId')
	@AllowRole(Role.STAFF)
	@ApiResponse({
		type: TestCaseResponseDto,
		status: HttpStatus.CREATED,
	})
	async create(
		@Body() createTestCaseRequest: CreateTestCaseDto,
		@Param(
			'problemId',
			new ParseIntPipe({
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		problemId: number,
	): Promise<TestCaseResponseDto> {
		return new TestCaseResponseDto(
			await this.testCaseService.create(
				problemId,
				createTestCaseRequest,
			),
		);
	}

	@Get()
	@AllowRole(Role.STAFF)
	@ApiResponse({
		status: HttpStatus.OK,
		type: TestCaseResponseDto,
		isArray: true,
	})
	async findAll() {
		return this.testCaseService.findAll();
	}

	@Get('problem/:problemId')
	@AllowRole(Role.MEMBER)
	@ApiResponse({
		status: HttpStatus.OK,
		type: TestCaseResponseDto,
		isArray: true,
	})
	async findTestCasesByProblemId(
		@Request() req: authenticatedRequest,
		@Param(
			'problemId',
			new ParseIntPipe({
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		problemId: number,
	): Promise<TestCaseResponseDto[]> {
		return this.testCaseService.findTestCasesByProblemId(req, problemId);
	}

	@Get(':id')
	@AllowRole(Role.MEMBER)
	@ApiResponse({
		status: HttpStatus.OK,
		type: TestCaseResponseDto,
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
	): Promise<TestCaseResponseDto> {
		return this.testCaseService.findOne({ where: { id } });
	}

	@Patch(':id')
	@AllowRole(Role.STAFF)
	@ApiResponse({
		status: HttpStatus.OK,
		type: TestCaseResponseDto,
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
		@Request() req: authenticatedRequest,
		@Body() updateTestCaseDto: UpdateTestCaseDto,
	): Promise<TestCaseResponseDto> {
		return new TestCaseResponseDto(
			await this.testCaseService.update(id, updateTestCaseDto),
		);
	}

	@Delete(':id')
	@AllowRole(Role.STAFF)
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiResponse({
		status: HttpStatus.NO_CONTENT,
	})
	async remove(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
	): Promise<void> {
		await this.testCaseService.remove(id);
	}
}
