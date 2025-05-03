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
} from '@nestjs/common';
import { TestCaseService } from './test-case.service';
import {
	CreateTestCaseDto,
	UpdateTestCaseDto,
} from './dto/create-test-case.dto';
import { AllowRole } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/shared/enum/role.enum';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';

@Controller('test-case')
export class TestCaseController {
	constructor(private readonly testCaseService: TestCaseService) {}

	@Post(':problemId')
	@AllowRole(Role.STAFF)
	async create(
		@Body() createTestCaseRequest: CreateTestCaseDto,
		@Param(
			'problemId',
			new ParseIntPipe({
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		problemId: number,
	) {
		return await this.testCaseService.create(
			createTestCaseRequest,
			problemId,
		);
	}

	@Get()
	@AllowRole(Role.STAFF)
	async findAll() {
		return this.testCaseService.findAll();
	}

	@Get('problem/:problemId')
	@AllowRole(Role.MEMBER)
	async findTestCasesByProblemId(
		@Request() req: authenticatedRequest,
		@Param(
			'problemId',
			new ParseIntPipe({
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		problemId: number,
	) {
		return this.testCaseService.findTestCasesByProblemId(req, problemId);
	}

	@Get(':id')
	@AllowRole(Role.MEMBER)
	async findOne(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
	) {
		return this.testCaseService.findOne(id);
	}

	@Patch(':id')
	@AllowRole(Role.STAFF)
	async update(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
		@Body() updateTestCaseDto: UpdateTestCaseDto,
	) {
		return this.testCaseService.update(id, updateTestCaseDto);
	}

	@Delete(':id')
	@AllowRole(Role.STAFF)
	asyncremove(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
	) {
		return this.testCaseService.remove(id);
	}
}
