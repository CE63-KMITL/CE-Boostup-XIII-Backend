import {
	BadRequestException,
	ForbiddenException,
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
		private readonly userService: UserService,
		private readonly runCodeService: RunCodeService,
		private readonly testCaseService: TestCaseService,
	) { }

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

		const testCasesResult = [];
		for (let testCase of createProblemRequest.testCases) {
			testCasesResult.push({
				...testCase,
				expectOutput: await this.testCaseService.getExpectedOutput(
					createProblemRequest.solutionCode,
					testCase.input,
				),
			});
		}

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

	async updateDraft(
		id: number,
		updateProblemRequest: UpdateProblemDto,
		user: jwtPayloadDto,
	): Promise<Problem> {
		try {
			const problem = await this.problemsRepository.findOneBy({
				id: id,
			});
			const problemAuthorId = problem.author.id;
			// Only owner of the problem can edit
			if (problemAuthorId == user.userId) {
				await this.problemsRepository.update(
					id,
					updateProblemRequest,
				);
				// Update problem status if there is an update to solution code
				if ('solutionCode' in updateProblemRequest) {
					problem.devStatus = ProblemStaffStatusEnum.IN_PROGRESS;
					// TODO: Change score (Look into score-log dto)
					// TODO: We might need to add problemId to score-log, otherwise we won't know where the score came from
					// Loop through all testCases and runCode with their input
					for (var testCase of problem.testCases) {
						const input = testCase.input;
						const code = updateProblemRequest.solutionCode;
						const result = await this.runCodeService.runCode(
							input,
							code,
						);
						// Set to new output
						testCase.expectOutput = result.output
					}
					await this.problemsRepository.save(problem);
				}
				return this.findOne(id);
			} else {
				throw new UnauthorizedException(
					'must be the owner of problem',
				);
			}
		} catch (error) {
			throw new NotFoundException('problem not found');
		}
	}

	async remove(id: number): Promise<void> {
		await this.problemsRepository.delete(id);
	}

	async approveProblem(id: number, user: jwtPayloadDto): Promise<void> {
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
		payload: jwtPayloadDto,
		problemId: number,
	) {
		const { userId } = payload;
		const { code } = problemSubmission;
		const problem = await this.findOne(problemId);
		const { testCases } = problem;
		if (testCases.length === 0)
			throw new BadRequestException('no test case for this problem');
		const runCodeResponse = await Promise.all(
			testCases.map((testCase) =>
				this.runCodeService.runCode(testCase.input, code, 1 * 1000),
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
					1 * 1000,
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
}
