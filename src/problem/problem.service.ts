import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { GLOBAL_CONFIG } from '../shared/constants/global-config.constant';
import {
	CreateProblemDto,
	ProblemSearchRequest,
} from './dto/problem-create.dto';
import {
	ProblemPaginatedDto,
	ProblemSearchRespond,
	ProblemWithUserStatus,
} from './dto/problem-respond.dto';
import { Problem } from './problem.entity';
import { UpdateProblemDto } from './dto/problem-update.dto';
import { createPaginationQuery } from 'src/shared/pagination/create-pagination';
import { PaginationMetaDto } from 'src/shared/pagination/dto/pagination-meta.dto';

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

	async findAll(
		query: PaginationMetaDto<Problem>,
	): Promise<ProblemPaginatedDto> {
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

	async findOne(id: string): Promise<Problem> {
		const problem = await this.problemsRepository.findOneBy({ id });
		if (!problem) {
			throw new NotFoundException(`Problem with ID ${id} not found`);
		}
		return problem;
	}

	async getDetail(id: string): Promise<string> {
		const problem = await this.findOne(id);
		return problem.description || 'No detail available';
	}

	async search(
		query: ProblemSearchRequest,
		user,
	): Promise<ProblemSearchRespond> {
		let searchText = query.searchText;
		let idReverse = query.idReverse == 'true';
		let tags = query.tags ? JSON.parse(query.tags) : [];
		let minDifficulty = Number(query.minDifficulty);
		let maxDifficulty = Number(query.maxDifficulty);
		let status = query.status;
		let page = Number(query.page);
		let difficultySortBy = query.difficultySortBy;

		const pageNumber = Number(page);
		const take = GLOBAL_CONFIG.DEFAULT_PROBLEM_PAGE_SIZE;
		const skip =
			(isNaN(pageNumber) || pageNumber < 1 ? 0 : pageNumber - 1) *
			take;
		const searchProblems = this.problemsRepository
			.createQueryBuilder('problem')
			.leftJoin('problem.author', 'author')
			.select([
				'problem.id',
				'problem.title',
				'problem.difficulty',
				'problem.devStatus',
				'problem.tags',
				'author.name',
				'author.icon',
			]);

		if (searchText && searchText != '') {
			searchProblems.andWhere(
				'(LOWER(author.name) LIKE LOWER(:term) OR LOWER(problem.title) LIKE LOWER(:term))',
				{
					term: `%${searchText}%`,
				},
			);
		}

		if (tags && tags.length > 0) {
			searchProblems.andWhere('problem.tags && ARRAY[:...tags]', {
				tags,
			});
		}

		if (minDifficulty || maxDifficulty) {
			if (minDifficulty && maxDifficulty) {
				searchProblems.andWhere(
					'problem.difficulty BETWEEN :minDifficulty AND :maxDifficulty',
					{
						minDifficulty: Number(minDifficulty),
						maxDifficulty: Number(maxDifficulty),
					},
				);
			} else if (minDifficulty) {
				searchProblems.andWhere(
					'problem.difficulty >= :minDifficulty',
					{
						minDifficulty: Number(minDifficulty),
					},
				);
			} else if (maxDifficulty) {
				searchProblems.andWhere(
					'problem.difficulty <= :maxDifficulty',
					{
						maxDifficulty: Number(maxDifficulty),
					},
				);
			}
		}
		searchProblems.orderBy('problem.id', idReverse ? 'DESC' : 'ASC');

		if (difficultySortBy) {
			searchProblems.addOrderBy(
				'problem.difficulty',
				difficultySortBy,
			);
		}

		searchProblems.skip(skip).take(take);
		let items: ProblemWithUserStatus[] = [];
		let total = 0;

		const [allItems, totalBeforeStatus] =
			await searchProblems.getManyAndCount();

		const itemsWithStatus = await Promise.all(
			allItems.map(async (item: ProblemWithUserStatus) => {
				item.status = await this.userService.getProblemStatus(
					user.userId,
					item.id,
				);
				return item;
			}),
		);

		if (status && (status as string) !== '') {
			items = itemsWithStatus.filter((item) => item.status === status);
			total = items.length;
			items = items.slice(skip, skip + take);
		} else {
			items = itemsWithStatus;
			total = totalBeforeStatus;
		}

		return {
			items,
			pageCount: Math.ceil(total / take),
		};
	}

	async update(
		id: string,
		updateProblemRequest: UpdateProblemDto,
	): Promise<Problem> {
		await this.findOne(id);
		await this.problemsRepository.update(id, updateProblemRequest);
		return this.findOne(id);
	}

	async remove(id: string): Promise<Problem> {
		const problem = await this.findOne(id);
		await this.problemsRepository.delete(id);
		return problem;
	}
}
