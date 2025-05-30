import {
	BadRequestException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { jwtPayloadDto } from 'src/auth/dtos/jwt-payload.dto';
import { Role } from 'src/shared/enum/role.enum';
import { createPaginationQuery } from 'src/shared/pagination/create-pagination';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { UserService } from 'src/user/user.service';
import { Brackets, Repository } from 'typeorm';
import { CreateProblemDto } from './dtos/problem-create.dto';
import { ProblemSearchQueryDto } from './dtos/problem-query.dto';
import {
	ProblemPaginatedDto,
	ProblemSearchedDto,
	ProblemSearchedPaginatedDto,
} from './dtos/problem-response.dto';
import { UpdateProblemDto } from './dtos/problem-update.dto';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from './enums/problem-staff-status.enum';
import { Problem } from './problem.entity';
import { ProblemSubmissionDto } from './dtos/code-submission-dto/problem-submission.dto';
import { RunCodeService } from 'src/run_code/run-code.service';
import { ProblemStatus } from 'src/user/problem_status/problem-status.entity';
import { RejectProblemDTO } from './dtos/problem-reject.dto';
import { RunCodeExitStatusEnum } from 'src/run_code/enum/run-code-exit-status.enum';
import { ProblemSubmissionResponseDto } from './dtos/code-submission-dto/problem-submission-response.dto';

//-------------------------------------------------------
// Class Definition
//-------------------------------------------------------
@Injectable()
export class ProblemService {
	constructor(
		@InjectRepository(Problem)
		private readonly problemsRepository: Repository<Problem>,

		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,

		@Inject(forwardRef(() => RunCodeService))
		private readonly runCodeService: RunCodeService,
	) {}

	//-------------------------------------------------------
	// Problem Management (CRUD)
	//-------------------------------------------------------
	async create(
		createProblemRequest: CreateProblemDto,
		userId: string,
	): Promise<Problem> {
		const existProblem = await this.problemsRepository.findOneBy({
			title: createProblemRequest.title,
		});

		if (existProblem) {
			throw new BadRequestException(
				'Title must be unique. A problem with this title already exists.',
			);
		}

		const author = await this.userService.findOne({
			where: { id: userId },
		});

		const problem = this.problemsRepository.create({
			...createProblemRequest,
			author: author,
		});

		await this.checkSameTestCase(problem);

		try {
			await this.fillExpectOutput(problem);
		} catch (error) {}

		return this.problemsRepository.save(problem);
	}

	async findAll(query: PaginationMetaDto): Promise<ProblemPaginatedDto> {
		const qb = await createPaginationQuery<Problem>({
			repository: this.problemsRepository,
			dto: query,
		});
		qb.leftJoinAndSelect('entity.author', 'author');
		const [data, totalItem] = await qb.getManyAndCount();
		return new ProblemPaginatedDto(
			data,
			totalItem,
			query.limit,
			query.page,
		);
	}

	async findOne(id: number): Promise<Problem> {
		const problem = await this.problemsRepository.findOne({
			where: { id },
			relations: ['author'],
		});
		if (!problem) {
			throw new NotFoundException(`Problem with ID ${id} not found`);
		}

		return problem;
	}

	async update(
		id: number,
		updateProblemRequest: UpdateProblemDto,
		user: jwtPayloadDto,
	): Promise<Problem> {
		const problem = await this.findOne(id);

		if (problem.author.id !== user.userId) {
			throw new ForbiddenException(
				'Must be the owner of the problem to update.',
			);
		}

		const originalDifficulty = problem.difficulty;
		const originalTestCases = problem.testCases;
		const originalSolutionCode = problem.solutionCode;
		const originalHeaderMode = problem.headerMode;
		const originalFunctionMode = problem.functionMode;
		const originalHeaders = problem.headers;
		const originalFunctions = problem.functions;
		const originalTimeLimit = problem.timeLimit;

		// Update basic properties first
		problem.title = updateProblemRequest.title ?? problem.title;
		problem.description =
			updateProblemRequest.description ?? problem.description;
		problem.tags = updateProblemRequest.tags ?? problem.tags;
		problem.difficulty =
			updateProblemRequest.difficulty ?? problem.difficulty;
		problem.defaultCode =
			updateProblemRequest.defaultCode ?? problem.defaultCode;

		// Check for duplicate title if title is updated
		if (
			updateProblemRequest.title &&
			updateProblemRequest.title !== problem.title
		) {
			const existProblem = await this.problemsRepository.findOneBy({
				title: updateProblemRequest.title,
			});

			if (existProblem && problem.id !== existProblem.id) {
				throw new BadRequestException(
					'The problem title already exists.',
				);
			}
		}

		// Determine if "important" changes occurred
		let importantChanged = false;

		// Check test cases change (input or isHiddenTestcase)
		if (
			JSON.stringify(updateProblemRequest.testCases) !==
			JSON.stringify(
				originalTestCases.map((tc) => ({
					input: tc.input,
					isHiddenTestcase: tc.isHiddenTestcase,
				})),
			)
		) {
			importantChanged = true;
			// Map CreateTestCase[] to TestCase[] with undefined expectOutput initially
			problem.testCases = updateProblemRequest.testCases.map((tc) => ({
				input: tc.input,
				isHiddenTestcase: tc.isHiddenTestcase,
				expectOutput: undefined, // Initialize expectOutput as undefined
			}));
		}

		// Check solution code change
		if (
			updateProblemRequest.solutionCode &&
			updateProblemRequest.solutionCode.trim() !==
				(originalSolutionCode?.trim() ?? '')
		) {
			importantChanged = true;
			problem.solutionCode = updateProblemRequest.solutionCode; // Update solution code immediately if changed
		}

		// Check mode changes
		if (
			updateProblemRequest.headerMode !== originalHeaderMode ||
			updateProblemRequest.functionMode !== originalFunctionMode
		) {
			importantChanged = true;
			problem.headerMode = updateProblemRequest.headerMode;
			problem.functionMode = updateProblemRequest.functionMode;
		}

		// Check headers change
		if (
			JSON.stringify(updateProblemRequest.headers) !==
			JSON.stringify(originalHeaders)
		) {
			importantChanged = true;
			problem.headers = updateProblemRequest.headers;
		}

		// Check functions change
		if (
			JSON.stringify(updateProblemRequest.functions) !==
			JSON.stringify(originalFunctions)
		) {
			importantChanged = true;
			problem.functions = updateProblemRequest.functions;
		}

		// Check time limit change
		if (updateProblemRequest.timeLimit !== originalTimeLimit) {
			importantChanged = true;
			problem.timeLimit = updateProblemRequest.timeLimit;
		}

		// Check if any existing test case was missing expectOutput (implies it needs recalculation)
		if (originalTestCases.some((tc) => !tc.expectOutput)) {
			importantChanged = true;
		}

		if (importantChanged) {
			problem.devStatus = ProblemStaffStatusEnum.IN_PROGRESS;

			// Re-calculate expectOutput for all test cases
			await this.checkSameTestCase(problem); // Clean up duplicate test cases
			try {
				await this.fillExpectOutput(problem);
			} catch (error) {
				// Save the problem state before throwing the error
				await this.problemsRepository.save(problem); // Use save instead of update to handle relations/test cases
				throw error;
			}

			// Save the problem here so submission uses the updated data
			await this.problemsRepository.save(problem);

			// Find users who completed the problem based on the OLD state
			const usersToReset = await this.userService.findAll(
				{
					where: {
						problemStatus: {
							problemId: problem.id,
							status: ProblemStatusEnum.DONE,
						},
					},
					relations: ['problemStatus'],
				},
				false,
			);

			// Reset status and score for users who completed the problem
			for (const userToReset of usersToReset) {
				// Calculate score to remove based on the ORIGINAL difficulty
				const scoreToRemove = this.calScore(originalDifficulty);

				await this.userService.modifyScore(
					userToReset.id,
					-scoreToRemove,
					problem.author.id,
					`โจทย์มีการแก้ไข : ${problem.title}`,
				);

				await this.userService.setProblemStatus(
					problem.id,
					userToReset.id,
					ProblemStatusEnum.IN_PROGRESS,
				);

				// Re-submit their code - this will update their status and score based on the NEW problem state
				// Need to find the specific problemStatus entry for this problem and user
				const userProblemStatusEntry =
					userToReset.problemStatus.find(
						(ps) => ps.problemId === problem.id,
					);
				if (userProblemStatusEntry) {
					await this.submission(
						new ProblemSubmissionDto({
							code: userProblemStatusEntry.code,
						}),
						userToReset.id,
						problem.id,
					);
				}
			}
		} else if (updateProblemRequest.difficulty !== originalDifficulty) {
			// Only difficulty changed, and no important changes occurred
			const newDifficulty = updateProblemRequest.difficulty;

			// Find users who completed the problem
			const usersToAdjustScore = await this.userService.findAll(
				{
					where: {
						problemStatus: {
							problemId: problem.id,
							status: ProblemStatusEnum.DONE,
						},
					},
					relations: ['problemStatus'],
				},
				false,
			);

			const scoreDifference =
				this.calScore(newDifficulty) -
				this.calScore(originalDifficulty);

			// Adjust score for users who completed the problem
			// Only modify score if there is a difference
			if (scoreDifference !== 0) {
				for (const userToAdjust of usersToAdjustScore) {
					await this.userService.modifyScore(
						userToAdjust.id,
						scoreDifference,
						problem.author.id,
						`โจทย์มีการปรับความยาก : ${problem.title}`,
					);
				}
			}
		}

		// Save the problem entity after all updates and side effects
		// This save is needed for basic property updates or if only difficulty changed
		// If importantChanged was true, the problem was already saved after fillExpectOutput
		// However, saving again here is harmless and ensures the final state is persisted.
		await this.problemsRepository.save(problem);

		return problem; // Return the updated problem entity
	}

	async remove(id: number): Promise<void> {
		await this.problemsRepository.delete(id);
	}

	//-------------------------------------------------------
	// Problem Search
	//-------------------------------------------------------
	async search(
		query: ProblemSearchQueryDto,
		user: jwtPayloadDto,
	): Promise<ProblemSearchedPaginatedDto> {
		const {
			page,
			searchText,
			difficultySortBy,
			maxDifficulty,
			minDifficulty,
			idReverse,
			limit,
			status,
			tags,
			staff,
			author,
		} = query;

		const result = new ProblemSearchedPaginatedDto([], 0, page, limit);

		const { role, userId } = user;

		const searchProblems = await createPaginationQuery<Problem>({
			repository: this.problemsRepository,
			dto: { page, limit },
		});

		searchProblems.leftJoinAndSelect('entity.author', 'author');

		if (!!author) {
			searchProblems.andWhere(
				'LOWER(author.name) LIKE LOWER(:author)',
				{
					author: `%${author}%`,
				},
			);
		}

		if (searchText) {
			const numericSearchText = parseInt(searchText, 10);
			const isNumeric = !isNaN(numericSearchText);

			searchProblems.andWhere(
				new Brackets((qb) => {
					qb.where(
						'(LOWER(author.name) LIKE LOWER(:term) OR LOWER(entity.title) LIKE LOWER(:term))',
						{ term: `%${searchText}%` },
					);
					if (isNumeric) {
						qb.orWhere('entity.id = :idParam', {
							idParam: numericSearchText,
						});
					}
				}),
			);
		}

		if (tags && tags.length > 0) {
			searchProblems.andWhere('entity.tags && ARRAY[:...tags]', {
				tags,
			});
		}

		if (minDifficulty || maxDifficulty) {
			if (minDifficulty && maxDifficulty) {
				searchProblems.andWhere(
					'entity.difficulty BETWEEN :minDifficulty AND :maxDifficulty',
					{
						minDifficulty: Number(minDifficulty),
						maxDifficulty: Number(maxDifficulty),
					},
				);
			} else if (minDifficulty) {
				searchProblems.andWhere(
					'entity.difficulty >= :minDifficulty',
					{
						minDifficulty: Number(minDifficulty),
					},
				);
			} else if (maxDifficulty) {
				searchProblems.andWhere(
					'entity.difficulty <= :maxDifficulty',
					{
						maxDifficulty: Number(maxDifficulty),
					},
				);
			}
		}

		if (difficultySortBy) {
			searchProblems.addOrderBy('entity.difficulty', difficultySortBy);
		} else {
			searchProblems.orderBy('entity.id', idReverse ? 'DESC' : 'ASC');
		}

		let userProblemStatus: ProblemStatus[] = [];

		if (!!staff) {
			if (role !== Role.STAFF && role !== Role.DEV) {
				throw new ForbiddenException('You do not have permission.');
			}

			if (!!status) {
				searchProblems.andWhere('entity.devStatus = :devStatus', {
					devStatus: status,
				});
			}
		} else {
			searchProblems.andWhere('entity.devStatus = :devStatus', {
				devStatus: ProblemStaffStatusEnum.PUBLISHED,
			});

			const userData = await this.userService.findOne({
				where: { id: userId },
				relations: { problemStatus: true },
			});

			if (!userData) return result;

			userProblemStatus = userData.problemStatus;

			if (!!status) {
				if (status === ProblemStatusEnum.NOT_STARTED) {
					if (userProblemStatus.length != 0) {
						const ids = userProblemStatus.map(
							(problem) => problem.problemId,
						);
						searchProblems.andWhere(
							'entity.id NOT IN (:...ids)',
							{
								ids,
							},
						);
					}
				} else {
					if (userProblemStatus.length === 0) return result;

					userProblemStatus = userProblemStatus.filter(
						(problem) => problem.status == status,
					);

					if (userProblemStatus.length === 0) return result;

					const ids = userProblemStatus.map(
						(problem) => problem.problemId,
					);
					searchProblems.andWhere('entity.id IN (:...ids)', {
						ids,
					});
				}
			}
		}

		const [data, totalItem] = await searchProblems.getManyAndCount();
		result.data = data.map((d) => {
			let status;

			if (staff) {
				status = d.devStatus;
			} else {
				const getUserProblemStatus = userProblemStatus.find(
					(userProblem) => userProblem.problemId === d.id,
				);
				status =
					getUserProblemStatus?.status ??
					ProblemStatusEnum.NOT_STARTED;
			}

			return new ProblemSearchedDto(d, status);
		});
		result.totalItem = totalItem;
		result.updateTotalPage();
		return result;
	}

	//-------------------------------------------------------
	// Code Execution
	//-------------------------------------------------------
	async runCode(problem: Problem | number, input: string, userCode: string) {
		if (typeof problem === 'number')
			problem = await this.findOne(problem);

		return await this.runCodeService.runCode({
			input,
			code: userCode,
			timeout: problem.timeLimit,
			functionMode: problem.functionMode,
			headerMode: problem.headerMode,
			headers: problem.headers,
			functions: problem.functions,
		});
	}

	async submission(
		problemSubmission: ProblemSubmissionDto,
		userId: string,
		problemId: number,
	) {
		const { code } = problemSubmission;
		const problem = await this.findOne(problemId);
		const { testCases } = problem;

		if (testCases.length === 0)
			throw new BadRequestException('no test case for this problem');

		const runCodeResponse =
			await this.runCodeService.runCodeMultipleInputs({
				inputs: testCases.map((testCase) => testCase.input),
				code,
				timeout: problem.timeLimit,
				functionMode: problem.functionMode,
				headerMode: problem.headerMode,
				headers: problem.headers,
				functions: problem.functions,
			});

		const response = runCodeResponse.map((result, i) => {
			return new ProblemSubmissionResponseDto(testCases[i], result);
		});

		await this.userService.updateProblemStatus(
			problemId,
			userId,
			response.some((d) => d.isPass === false)
				? ProblemStatusEnum.IN_PROGRESS
				: ProblemStatusEnum.DONE,
			code,
			problem.difficulty,
		);

		return response;
	}

	checkAllowCode(problem: Problem, codeString: string) {
		return this.runCodeService.checkAllowCode({
			codeString,
			functions: problem.functions,
			functionMode: problem.functionMode,
			headerMode: problem.headerMode,
			headers: problem.headers,
		});
	}

	//-------------------------------------------------------
	// Problem Status Management
	//-------------------------------------------------------
	async requestReviewProblem(id: number, user: jwtPayloadDto) {
		const problem = await this.findOne(id);

		if (user.userId !== problem.author.id)
			throw new ForbiddenException("You're not the author");

		await this.problemsRepository.update(id, {
			devStatus: ProblemStaffStatusEnum.NEED_REVIEW,
		});

		return 'Success';
	}

	async approve(id: number, user: jwtPayloadDto) {
		const problem = await this.problemsRepository.findOne({
			where: { id },
		});
		if (!problem)
			throw new NotFoundException(`Problem with ID ${id} not found`);
		if (problem.testCases.length === 0) {
			throw new BadRequestException(
				'No test case for this problem (should have at least 1 test case before publish)',
			);
		}
		await this.problemsRepository.update(id, {
			devStatus: ProblemStaffStatusEnum.PUBLISHED,
		});

		return 'Success';
	}

	async rejectProblem(
		id: number,
		message: RejectProblemDTO,
		user: jwtPayloadDto,
	) {
		await this.problemsRepository.update(id, {
			devStatus: ProblemStaffStatusEnum.REJECTED,
			rejectedMessage: message.message,
		});

		return 'Success';
	}

	async archiveProblem(id: number, user: jwtPayloadDto) {
		const problem = await this.findOne(id);

		if (user.userId !== problem.author.id)
			throw new ForbiddenException("You're not the author");

		await this.problemsRepository.update(id, {
			devStatus: ProblemStaffStatusEnum.ARCHIVED,
		});

		return 'Success';
	}

	//-------------------------------------------------------
	// Helper Methods
	//-------------------------------------------------------
	calScore(difficulty: number): number {
		return Number(
			difficulty <= 3
				? difficulty
				: (difficulty * (difficulty - 1)) / 2,
		);
	}

	async fillExpectOutput(problem: Problem) {
		const expectOutput = await this.runCodeService.runCodeMultipleInputs({
			inputs: problem.testCases.map((testCase) => testCase.input),
			code: problem.solutionCode,
			timeout: problem.timeLimit,
			functionMode: problem.functionMode,
			headerMode: problem.headerMode,
			headers: problem.headers,
			functions: problem.functions,
		});
		problem.testCases.forEach((testCase, i) => {
			if (
				expectOutput[i].exit_status != RunCodeExitStatusEnum.SUCCESS
			) {
				throw new BadRequestException(
					`Test case ${[i + 1]} have input :\n>>>>>>>>>>>>>\n${testCase.input}\n>>>>>>>>>>>>>\n\nhas error:\n>>>>>>>>>>>>>\n${expectOutput[i].output}\n>>>>>>>>>>>>>\n`,
				);
			}
			testCase.expectOutput = expectOutput[i].output;
		});
	}

	async checkSameTestCase(problem: Problem) {
		const clearedTestCases = [];

		for (const testCase of problem.testCases) {
			if (!clearedTestCases.find((t) => t.input === testCase.input)) {
				clearedTestCases.push(testCase);
			} else {
				// throw new BadRequestException(
				// 	`Have duplicate test case that have input :\n\n>>>>>>>>>>>>>\n${testCase.input}\n>>>>>>>>>>>>>`,
				// );
			}
		}

		problem.testCases = clearedTestCases;
	}
}
