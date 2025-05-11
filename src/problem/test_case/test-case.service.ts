import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {
	CreateTestCaseDto,
	UpdateTestCaseDto,
} from './dto/create-test-case.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TestCase } from './test-case.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { ProblemService } from 'src/problem/problem.service';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Role } from 'src/shared/enum/role.enum';
import { TestCaseResponseDto } from './dto/test-case-response.dto';
import { RunCodeService } from 'src/run_code/run-code.service';
import { Problem } from '../problem.entity';
import { RunCodeExitStatusEnum } from 'src/run_code/enum/run-code-exit-status.enum';

@Injectable()
export class TestCaseService {
	constructor(
		@InjectRepository(TestCase)
		private readonly testCaseRepository: Repository<TestCase>,

		@Inject(forwardRef(() => ProblemService))
		private readonly problemService: ProblemService,
		@Inject(forwardRef(() => RunCodeService))
		private readonly runCodeService: RunCodeService,
	) {}

	async checkTestCaseExist(problem: Problem | number, input: string) {
		if (!(problem instanceof Problem)) {
			problem = await this.problemService.findOne(problem);
		}
		if (problem.testCases.some((testCase) => testCase.input === input)) {
			throw new BadRequestException('Test case already exist');
		}
	}

	async getExpectedOutput(
		solutionCode: string,
		input: string,
		timeLimit: number,
	) {
		const runCodeResult = await this.runCodeService.runCode(
			input,
			solutionCode,
			timeLimit,
		);
		if (runCodeResult.exit_status != RunCodeExitStatusEnum.SUCCESS) {
			throw new BadRequestException(
				`Test case failed at input:\n>>>\n${input}\n>>>\nused time: ${runCodeResult.used_time}ms\noutput:\n>>>\n${runCodeResult.output}\n>>>`,
			);
		}
		return runCodeResult.output;
	}

	async create(problemId: number, createTestCaseDto: CreateTestCaseDto) {
		const { isHiddenTestcase, input } = createTestCaseDto;

		const problem = await this.problemService.findOne(problemId);

		await this.checkTestCaseExist(problem, input);
		const expectOutput = await this.getExpectedOutput(
			problem.solutionCode,
			createTestCaseDto.input,
			problem.timeLimit,
		);

		return await this.testCaseRepository.save({
			input,
			expectOutput,
			isHiddenTestcase,
			problem,
		});
	}

	async findAll(): Promise<TestCaseResponseDto[]> {
		const allTestCases = await this.testCaseRepository.find();
		return allTestCases;
	}

	async findOne(option: FindOneOptions<TestCase>): Promise<TestCase> {
		const testCase = await this.testCaseRepository.findOne(option);
		if (!testCase) {
			throw new NotFoundException('Test case not found');
		}
		return testCase;
	}

	async findTestCasesByProblemId(
		req: authenticatedRequest,
		problemId: number,
	): Promise<TestCaseResponseDto[]> {
		const { role } = req.user;
		let testCases = await this.testCaseRepository.find({
			where: {
				isHiddenTestcase: role === Role.MEMBER ? false : undefined,
			},
			relations: {
				problem: true,
			},
		});
		testCases = testCases.filter(
			(testCase) => testCase.problem.id === problemId,
		);
		return testCases.map((testCase) => new TestCaseResponseDto(testCase));
	}

	async update(
		id: string,
		updateTestCaseDto: UpdateTestCaseDto,
	): Promise<TestCase> {
		const { input } = updateTestCaseDto;
		const testCase = await this.findOne({ where: { id } });
		if (!testCase)
			throw new NotFoundException(`not found test case id ${id}`);
		const problem = await this.problemService.findOne(
			testCase.problem.id,
		);
		this.checkTestCaseExist(problem, input);
		await this.testCaseRepository.update(id, updateTestCaseDto);
		return testCase;
	}

	async remove(id: string): Promise<void> {
		await this.testCaseRepository.delete(id);
	}
}
