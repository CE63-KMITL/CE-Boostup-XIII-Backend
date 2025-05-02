import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { jwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { Role } from 'src/shared/enum/role.enum';
import { createPaginationQuery } from 'src/shared/pagination/create-pagination';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateProblemDto } from './dto/problem-create.dto';
import { ProblemQueryDto } from './dto/problem-query.dto';
import { ProblemPaginatedDto } from './dto/problem-respond.dto';
import { UpdateProblemDto } from './dto/problem-update.dto';
import { ProblemStatusEnum } from './enum/problem-staff-status.enum';
import { Problem } from './problem.entity';

@Injectable()
export class ProblemService {
	constructor(
		@InjectRepository(Problem)
		private readonly problemsRepository: Repository<Problem>,
		private readonly userService: UserService,
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
		const author = await this.userService.findOne({
			where: { id: userId },
		});
		const problem = this.problemsRepository.create({
			...createProblemRequest,
			author: author,
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
		query: ProblemQueryDto,
		user: jwtPayloadDto,
	): Promise<ProblemPaginatedDto> {
		const {
			page,
			searchText,
			difficultySortBy,
			maxDifficulty,
			minDifficulty,
			idReverse,
			limit,
			status,
			devStatus,
			tags,
			staff,
		} = query;

		const { role, userId } = user;

		const searchProblems = await createPaginationQuery<Problem>({
			repository: this.problemsRepository,
			dto: { page, limit },
		});

		if (searchText && searchText != '') {
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

		searchProblems.orderBy('entity.id', idReverse ? 'DESC' : 'ASC');

		if (difficultySortBy) {
			searchProblems.addOrderBy('entity.difficulty', difficultySortBy);
		}

		if (role !== Role.MEMBER) {
			if (!!devStatus) {
				searchProblems.andWhere('entity.devStatus = :status', {
					devStatus,
				});
			}
		}
		if (!!status) {
			let problems = (
				await this.userService.findOne({
					where: { id: userId },
					relations: { problemStatus: true },
				})
			).problemStatus;

			if (status === ProblemStatusEnum.NOT_STARTED) {
				if (problems.length != 0) {
					const ids = problems.map(
						(problem) => problem.problemId,
					);
					searchProblems.andWhere('entity.id NOT IN (:...ids)', {
						ids,
					});
				}
			} else {
				if (problems.length === 0)
					throw new NotFoundException(`No problem status yet`);

				problems = problems.filter(
					(problem) =>
						ProblemStatusEnum[problem.status] === status,
				);

				if (problems.length === 0)
					throw new NotFoundException(
						`no problem with status ${status}`,
					);

				problems.map((problem) =>
					searchProblems.andWhere('entity.id = :id', {
						id: problem.problemId,
					}),
				);
			}
		}

		searchProblems.leftJoinAndSelect('entity.author', 'author');
		const [data, totalItem] = await searchProblems.getManyAndCount();
		return new ProblemPaginatedDto(
			data,
			totalItem,
			query.limit,
			query.page,
		);
	}

	async update(
		id: number,
		updateProblemRequest: UpdateProblemDto,
	): Promise<Problem> {
		try {
			await this.problemsRepository.update(id, updateProblemRequest);
			return this.findOne(id);
		} catch (error) {
			throw new NotFoundException('problem not found');
		}
	}

	async remove(id: number): Promise<void> {
		await this.problemsRepository.delete(id);
	}
}
