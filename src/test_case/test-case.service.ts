import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {
	CreateTestCaseDto,
	UpdateTestCaseDto,
} from './dto/create-test-case.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TestCase } from './test-case.entity';
import { Repository } from 'typeorm';
import { ProblemService } from 'src/problem/problem.service';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Role } from 'src/shared/enum/role.enum';
import { Problem } from 'src/problem/problem.entity';

@Injectable()
export class TestCaseService {
	constructor(
		@InjectRepository(TestCase)
		private readonly testCaseRepository: Repository<TestCase>,
		private readonly problemService: ProblemService,
	) {}

	async create(createTestCaseDto: CreateTestCaseDto, problemId: number) {
		const { expectOutput, isHiddenTestcase } = createTestCaseDto;
		const problem = await this.problemService.findOne(problemId);
		this.createProblemFilter(problem, expectOutput);
		return await this.testCaseRepository.save({
			expectOutput,
			isHiddenTestcase,
			problem,
		});
	}

	private createProblemFilter(problem: Problem, expectOutput: string): void {
		const testCaseOutput = problem.testCases.filter(
			(testcase) => testcase.expectOutput === expectOutput,
		);
		if (testCaseOutput.length !== 0) {
			throw new BadRequestException(
				`test case ${testCaseOutput[0].expectOutput} already exists`,
			);
		}
	}

	async findAll(): Promise<TestCase[]> {
		const allTestCases = await this.testCaseRepository.find();
		return allTestCases;
	}

	async findOne(id: string): Promise<TestCase> {
		const testCase = await this.testCaseRepository.findOne({
			where: { id },
			relations: { problem: true },
		});
		if (!testCase) {
			throw new NotFoundException(`Test case with ID ${id} not found`);
		}
		return testCase;
	}

	async findTestCasesByProblemId(
		req: authenticatedRequest,
		problemId: number,
	) {
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
		return testCases;
	}

	async update(
		id: string,
		updateTestCaseDto: UpdateTestCaseDto,
	): Promise<TestCase> {
		const { expectOutput } = updateTestCaseDto;
		const testCase = await this.findOne(id);
		if (!testCase)
			throw new NotFoundException(`not found test case id ${id}`);
		const problem = await this.problemService.findOne(
			testCase.problem.id,
		);
		if (expectOutput) {
			this.createProblemFilter(problem, expectOutput);
		}
		await this.testCaseRepository.update(id, updateTestCaseDto);
		return testCase;
	}

	async remove(id: string): Promise<TestCase> {
		const testCase = await this.findOne(id);
		await this.testCaseRepository.delete(id);
		return testCase;
	}
}
