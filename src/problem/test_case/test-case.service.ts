import { Injectable, NotFoundException } from '@nestjs/common';
import {
	CreateTestCaseDto,
	UpdateTestCaseDto,
} from './dto/test-case-create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TestCase } from './test-case.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { ProblemService } from 'src/problem/problem.service';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Role } from 'src/shared/enum/role.enum';
import { TestCaseResponseDto } from './dto/test-case-response.dto';
import { RunCodeService } from 'src/run_code/run-code.service';

@Injectable()
export class TestCaseService {
	constructor(
		@InjectRepository(TestCase)
		private readonly testCaseRepository: Repository<TestCase>,
		private readonly problemService: ProblemService,
		private readonly runCodeService: RunCodeService,
	) {}

	async create(problemId: number, createTestCaseDto: CreateTestCaseDto) {
		const { isHiddenTestcase, input } = createTestCaseDto;
		const problem = await this.problemService.findOne(problemId);

		problem.checkTestCase(input);

		const runCodeResult = await this.runCodeService.runCode(
			input,
			problem.solutionCode,
		);
		const expectOutput = runCodeResult.output;

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

	async findOne(option: FindOneOptions): Promise<TestCase> {
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
		problem.checkTestCase(input);
		await this.testCaseRepository.update(id, updateTestCaseDto);
		return testCase;
	}

	async remove(id: string): Promise<void> {
		await this.testCaseRepository.delete(id);
	}
}
