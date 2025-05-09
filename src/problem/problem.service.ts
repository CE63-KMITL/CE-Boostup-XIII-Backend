import {
	BadRequestException,
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException,
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
} from './dto/problem-respond.dto';
import { UpdateProblemDto } from './dto/problem-update.dto';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from './enum/problem-staff-status.enum';
import { Problem } from './problem.entity';
import { ProblemSubmissionDto } from './dto/code-submission-dto/problem-submission.dto';
import { RunCodeService } from 'src/run_code/run-code.service';
import {
	ProblemSubmissionResponseDto,
	RunDraftCodeResponseDto,
} from './dto/code-submission-dto/problem-submission-response.dto';
import { ProblemStatus } from 'src/user/problem_status/problem-status.entity';
import { RejectProblemDTO } from './dto/problem-reject.dto';
import { TestCaseService } from './test_case/test-case.service';

@Injectable()
export class ProblemService {
	constructor(
		@InjectRepository(Problem)
		private readonly problemsRepository: Repository<Problem>,

		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,

		@Inject(forwardRef(() => RunCodeService))
		private readonly runCodeService: RunCodeService,

		@Inject(forwardRef(() => TestCaseService))
		private readonly testCaseService: TestCaseService,
	) {}

	/*
	-------------------------------------------------------
	Create Problem
	-------------------------------------------------------
	*/
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

		const testCasesResult = await Promise.all(
			createProblemRequest.testCases.map(async (testCase) => {
				const expectOutput =
					await this.testCaseService.getExpectedOutput(
						createProblemRequest.solutionCode,
						testCase.input,
						createProblemRequest.timeLimit,
					);
				return {
					...testCase,
					expectOutput,
				};
			}),
		);

		const problem = this.problemsRepository.create({
			...createProblemRequest,
			author: author,
			testCases: testCasesResult,
		});

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
			relations: {
				author: true,
				testCases: true,
			},
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
			console.log(tags);
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
						(problem) =>
							ProblemStatusEnum[problem.status] === status,
					);

					if (userProblemStatus.length === 0) return result;

					userProblemStatus.map((problem) =>
						searchProblems.andWhere('entity.id = :id', {
							id: problem.problemId,
						}),
					);
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

	async update(
		id: number,
		updateProblemRequest: UpdateProblemDto,
		user: jwtPayloadDto,
	): Promise<Problem> {
		const problem = await this.problemsRepository.findOne({
			where: { id: id },
			relations: ['author', 'testCases'],
		});

		if (!problem) {
			throw new NotFoundException(`Problem with ID ${id} not found`);
		}

		if (problem.author.id !== user.userId) {
			throw new UnauthorizedException(
				'Must be the owner of the problem to update.',
			);
		}

		const originalDifficulty = problem.difficulty;
		let solutionCodeChanged = false;

		//-------------------------------------------------------
		// Handle solution code update
		//-------------------------------------------------------
		if (
			updateProblemRequest.solutionCode &&
			updateProblemRequest.solutionCode.trim() !==
				problem.solutionCode.trim()
		) {
			solutionCodeChanged = true;
			problem.devStatus = ProblemStaffStatusEnum.IN_PROGRESS;

			const newTimeLimit =
				updateProblemRequest.timeLimit ?? problem.timeLimit;
			const codeResult =
				await this.runCodeService.runCodeMultipleInputs(
					problem.testCases.map((testCase) => testCase.input),
					updateProblemRequest.solutionCode,
					newTimeLimit,
				);

			problem.testCases.forEach((testCase, index) => {
				testCase.expectOutput = codeResult[index];
			});

			problem.solutionCode = updateProblemRequest.solutionCode;

			const allUsers = await this.userService.findAll({});
			for (const userResponse of allUsers.data) {
				const problemStatus =
					await this.userService.findOneProblemStatus(
						userResponse.id,
						problem.id,
					);
				if (
					problemStatus &&
					problemStatus.status === ProblemStatusEnum.DONE
				) {
					await this.userService.updateProblemStatus(
						problem.id,
						userResponse.id,
						ProblemStatusEnum.IN_PROGRESS,
						problemStatus.code,
						problem.difficulty,
					);

					const scoreToRemove =
						this.calScore(originalDifficulty);

					await this.userService.modifyScore(
						userResponse.id,
						-scoreToRemove,
						user.userId,
						`โจทย์มีการแก้ไข้ : ${problem.title}`,
					);

					await this.submission(
						new ProblemSubmissionDto({
							code: problemStatus.code,
						}),
						userResponse.id,
						problem.id,
					);
				}
			}
		}

		//-------------------------------------------------------
		// Handle difficulty update (only if solution code didn't change)
		//-------------------------------------------------------
		if (
			!solutionCodeChanged &&
			updateProblemRequest.difficulty &&
			updateProblemRequest.difficulty !== originalDifficulty
		) {
			const newDifficulty = updateProblemRequest.difficulty;
			const allUsers = await this.userService.findAll({}); // Note: This might be paginated.
			for (const userResponse of allUsers.data) {
				const problemStatus =
					await this.userService.findOneProblemStatus(
						userResponse.id,
						problem.id,
					);
				if (
					problemStatus &&
					problemStatus.status === ProblemStatusEnum.DONE
				) {
					const scoreToRemove =
						this.calScore(originalDifficulty);
					await this.userService.modifyScore(
						userResponse.id,
						-scoreToRemove,
						user.userId,
						`Difficulty updated for problem: ${problem.title}`,
					);

					const scoreToAdd = this.calScore(newDifficulty);
					await this.userService.modifyScore(
						userResponse.id,
						scoreToAdd,
						user.userId,
						`Difficulty updated for problem: ${problem.title}`,
					);
					// If house scores need explicit adjustment, add here:
					// await this.houseScoreService.modifyScore(userResponse.houseId, -scoreToRemove, ...);
					// await this.houseScoreService.modifyScore(userResponse.houseId, scoreToAdd, ...);
				}
			}
			problem.difficulty = newDifficulty;
		}

		//-------------------------------------------------------
		// Apply other updates
		//-------------------------------------------------------
		const { solutionCode, difficulty, ...otherUpdates } =
			updateProblemRequest;
		Object.assign(problem, otherUpdates);

		await this.problemsRepository.save(problem);
		return this.findOne(id);
	}

	async remove(id: number): Promise<void> {
		await this.problemsRepository.delete(id);
	}

	async approve(id: number, user: jwtPayloadDto): Promise<void> {
		await this.problemsRepository.update(id, {
			devStatus: ProblemStaffStatusEnum.PUBLISHED,
		});
	}

	async runCode(problemId: number, userId: string, input: string) {
		const problem = await this.findOne(problemId);
		const userCode = (
			await this.userService.findOneProblemStatus(userId, problemId)
		).code;
		return await this.runCodeService.runCode(
			input,
			userCode,
			problem.timeLimit,
		);
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
		const runCodeResponse = await Promise.all(
			testCases.map((testCase) =>
				this.runCodeService.runCode(
					testCase.input,
					code,
					problem.timeLimit,
				),
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

	async runDraftCode(problemId: number) {
		const problem = await this.findOne(problemId);
		const testCases = problem.testCases;
		if (testCases.length === 0) {
			throw new BadRequestException('problem has no test case');
		}
		const result = await Promise.all(
			testCases.map((testCase) => {
				return this.runCodeService.runCode(
					testCase.input,
					JSON.parse(problem.solutionCode),
					problem.timeLimit,
				);
			}),
		);
		return result.map(
			(d, i) => new RunDraftCodeResponseDto(d, testCases[i].input),
		);
	}

	async requestReviewProblem(
		id: number,
		user: jwtPayloadDto,
	): Promise<void> {
		await this.problemsRepository.update(id, {
			devStatus: ProblemStaffStatusEnum.NEED_REVIEW,
		});
	}

	async archiveProblem(id: number, user: jwtPayloadDto): Promise<void> {
		await this.problemsRepository.update(id, {
			devStatus: ProblemStaffStatusEnum.ARCHIVED,
		});
	}

	async rejectProblem(
		id: number,
		message: RejectProblemDTO,
		user: jwtPayloadDto,
	): Promise<RejectProblemDTO> {
		await this.problemsRepository.update(id, {
			devStatus: ProblemStaffStatusEnum.ARCHIVED,
		});
		return message;
	}

	calScore(difficulty: number): number {
		return difficulty <= 3
			? difficulty
			: (difficulty * (difficulty - 1)) / 2;
	}
}
