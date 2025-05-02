import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { jwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { Role } from 'src/shared/enum/role.enum';
import { createPaginationQuery } from 'src/shared/pagination/create-pagination';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateProblemDto } from './dto/problem-create.dto';
import { ProblemQueryDto, ProblemUserQueryDto } from './dto/problem-query.dto';
import { ProblemPaginatedDto } from './dto/problem-respond.dto';
import { UpdateProblemDto } from './dto/problem-update.dto';
import {
	ProblemStaffStatusEnum,
	ProblemStatusEnum,
} from './enum/problem-staff-status.enum';
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
			tags,
			staff,
		} = query;

		let searchProblems;

		if (staff == 'true') {
			if (user.role != Role.STAFF && user.role != Role.DEV) {
				throw new NotFoundException('You do not have permission.');
			}
			searchProblems = await createPaginationQuery<Problem>({
				repository: this.problemsRepository,
				dto: { page, limit },
			});
		} else {
			searchProblems.andWhere('entity.devStatus = :status', {
				status: ProblemStaffStatusEnum.PUBLISHED,
			});

			if (!!status) {
			}
		}

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

		searchProblems.leftJoinAndSelect('entity.author', 'author');
		const [data, totalItem] = await searchProblems.getManyAndCount();
		return new ProblemPaginatedDto(
			data,
			totalItem,
			query.limit,
			query.page,
		);
	}

	async getProblemsByUserId(id: string, query: ProblemUserQueryDto) {
		const { limit, page, status } = query;
		let problems = (
			await this.userService.findOne({
				where: { id },
				relations: { problemStatus: true },
			})
		)?.problemStatus;

		if (!problems) {
			throw new NotFoundException('No problem status yet');
		}

		if (status) {
			problems = problems.filter(
				(problem) => ProblemStatusEnum[problem.status] === status,
			);
		}

		const totalItem = problems.length;

		problems = problems.slice((page - 1) * limit, page * limit);

		const resProblems = await Promise.all(
			problems.map(async (problem) => {
				return await this.problemsRepository.findOne({
					where: { id: problem.problemId },
					relations: {
						author: true,
					},
				});
			}),
		);
		return new ProblemPaginatedDto(resProblems, totalItem, limit, page);
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
