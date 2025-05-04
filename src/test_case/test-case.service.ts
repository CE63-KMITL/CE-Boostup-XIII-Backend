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
import { FindOneOptions, Repository } from 'typeorm';
import { ProblemService } from 'src/problem/problem.service';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { Role } from 'src/shared/enum/role.enum';
import { Problem } from 'src/problem/problem.entity';
import { TestCaseResponseDto } from './dto/test-case-response.dto';

@Injectable()
export class TestCaseService {
	constructor(
		@InjectRepository(TestCase)
		private readonly testCaseRepository: Repository<TestCase>,
		private readonly problemService: ProblemService,
	) {}

	async create(createTestCaseDto: CreateTestCaseDto, problemId: number) {
		const { expectOutput, isHiddenTestcase, input } = createTestCaseDto;
		const problem = await this.problemService.findOne(problemId);
		if (!!input) this.createProblemFilter(problem, input);
		return await this.testCaseRepository.save({
			input,
			expectOutput,
			isHiddenTestcase,
			problem,
		});
	}

	private createProblemFilter(problem: Problem, input: string): void {
		const testCaseOutput = problem.testCases.filter(
			(testcase) => testcase.input === input,
		);
		if (testCaseOutput.length !== 0) {
			throw new BadRequestException(
				`test case ${testCaseOutput[0].input} already exists`,
			);
		}
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
		if (input) {
			this.createProblemFilter(problem, input);
		}
		await this.testCaseRepository.update(id, updateTestCaseDto);
		return testCase;
	}

	async remove(id: string): Promise<void> {
		await this.testCaseRepository.delete(id);
	}
}
