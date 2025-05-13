import {
	BadRequestException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { jwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { Role } from 'src/shared/enum/role.enum';
import { createPaginationQuery } from 'src/shared/pagination/create-pagination';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateProblemDto } from './dto/problem-create.dto';
import { ProblemSearchQueryDto } from './dto/problem-query.dto';
import {
	ProblemPaginatedDto,
	ProblemSearchedDto,
	ProblemSearchedPaginatedDto,
} from './dto/problem-response.dto';
import { UpdateProblemDto } from './dto/problem-update.dto';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from './enum/problem-staff-status.enum';
import { Problem } from './problem.entity';
import { ProblemSubmissionDto } from './dto/code-submission-dto/problem-submission.dto';
import { RunCodeService } from 'src/run_code/run-code.service';
import { ProblemSubmissionResponseDto } from './dto/code-submission-dto/problem-submission-response.dto';
import { ProblemStatus } from 'src/user/problem_status/problem-status.entity';
import { RejectProblemDTO } from './dto/problem-reject.dto';
import { RunCodeExitStatusEnum } from 'src/run_code/enum/run-code-exit-status.enum';

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
			testCases: [],
		});

		await this.checkSameTestCase(problem);
		await this.fillExpectOutput(problem);

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

	async getDetail(id: number): Promise<string> {
		const problem = await this.findOne(id);
		return problem.description || 'No detail available';
	}

	async update(
		id: number,
		updateProblemRequest: UpdateProblemDto,
		user: jwtPayloadDto,
	): Promise<Problem> {
		const problem = await this.findOne(id);

		if (!problem) {
			throw new NotFoundException(`Problem with ID ${id} not found`);
		}

		if (problem.author.id !== user.userId) {
			throw new ForbiddenException(
				'Must be the owner of the problem to update.',
			);
		}

		const originalDifficulty = problem.difficulty;

		if (updateProblemRequest.title) {
			const existProblem = await this.problemsRepository.findOneBy({
				title: updateProblemRequest.title,
			});

			if (problem.id !== existProblem.id) {
				throw new BadRequestException(
					'The problem title already exists.',
				);
			}
		}

		let importantChanged =
			JSON.stringify(updateProblemRequest.testCases) !=
			JSON.stringify(problem.testCases);

		importantChanged =
			importantChanged ||
			(updateProblemRequest.solutionCode &&
				updateProblemRequest.solutionCode.trim() !=
					problem.solutionCode.trim());

		importantChanged =
			importantChanged ||
			updateProblemRequest?.headerMode !== problem.headerMode ||
			updateProblemRequest?.functionMode !== problem.functionMode;

		importantChanged =
			importantChanged ||
			JSON.stringify(updateProblemRequest.headers) !=
				JSON.stringify(problem.headers);

		importantChanged =
			importantChanged ||
			JSON.stringify(updateProblemRequest.functions) !=
				JSON.stringify(problem.functions);

		Object.assign(problem, updateProblemRequest);

		if (importantChanged) {
			problem.devStatus = ProblemStaffStatusEnum.IN_PROGRESS;

			problem.timeLimit =
				updateProblemRequest.timeLimit ?? problem.timeLimit;
			problem.solutionCode =
				updateProblemRequest.solutionCode ?? problem.solutionCode;

			await this.checkSameTestCase(problem);
			await this.fillExpectOutput(problem);

			const users = await this.userService.findAll(
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

			for (const user of users) {
				await this.userService.updateProblemStatus(
					problem.id,
					user.id,
					ProblemStatusEnum.IN_PROGRESS,
					user.problemStatus[0].code,
					problem.difficulty,
				);

				const scoreToRemove = this.calScore(originalDifficulty);

				await this.userService.modifyScore(
					user.id,
					-scoreToRemove,
					problem.author.id,
					`โจทย์มีการแก้ไข : ${problem.title}`,
				);

				await this.submission(
					new ProblemSubmissionDto({
						code: user.problemStatus[0].code,
					}),
					user.id,
					problem.id,
				);
			}
		}

		//-------------------------------------------------------
		// Handle difficulty update (only if solution code didn't change)
		//-------------------------------------------------------
		if (
			!importantChanged &&
			updateProblemRequest.difficulty &&
			updateProblemRequest.difficulty !== originalDifficulty
		) {
			const newDifficulty = updateProblemRequest.difficulty;

			const users = await this.userService.findAll(
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

			for (const user of users) {
				const scoreToRemove = this.calScore(originalDifficulty);
				await this.userService.modifyScore(
					user.id,
					-scoreToRemove,
					problem.author.id,
					`โจทย์มีการปรับความยาก : ${problem.title}`,
				);

				const scoreToAdd = this.calScore(newDifficulty);
				await this.userService.modifyScore(
					user.id,
					scoreToAdd,
					problem.author.id,
					`โจทย์มีการปรับความยาก : ${problem.title}`,
				);
			}

			problem.difficulty = newDifficulty;
		}

		return await this.problemsRepository.save(problem);
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
			searchProblems.andWhere('author.name ILIKE :author', {
				author: `%${author}%`,
			});
		}

		if (searchText) {
			searchProblems.andWhere(
				'(LOWER(author.name) LIKE LOWER(:term) OR LOWER(entity.title) LIKE LOWER(:term))',
				{
					term: `%${searchText}%`,
				},
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

					console.log(userProblemStatus);

					userProblemStatus = userProblemStatus.filter(
						(problem) => problem.status == status,
					);

					console.log(userProblemStatus, status);

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
	async runCode(problem: Problem | number, userId: string, input: string) {
		if (typeof problem === 'number')
			problem = await this.findOne(problem);

		const userCode = (
			await this.userService.findOneProblemStatus(userId, problem.id)
		).code;

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
		const codeString = JSON.parse(code) ?? code;
		const problem = await this.findOne(problemId);
		const { testCases } = problem;

		if (testCases.length === 0)
			throw new BadRequestException('no test case for this problem');

		this.checkAllowCode(problem, codeString);

		const runCodeResponse = await Promise.all(
			testCases.map((testCase) =>
				this.runCode(problem, userId, testCase.input),
			),
		);

		const response = runCodeResponse.map((result, i) => {
			return new ProblemSubmissionResponseDto(
				testCases[i].isHiddenTestcase ? undefined : result,
				result.output === testCases[i].expectOutput,
			);
		});

		await this.userService.updateProblemStatus(
			problemId,
			userId,
			response.some((d) => d.isPass === false)
				? ProblemStatusEnum.IN_PROGRESS
				: ProblemStatusEnum.DONE,
			JSON.stringify(code),
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
		return difficulty <= 3
			? difficulty
			: (difficulty * (difficulty - 1)) / 2;
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
