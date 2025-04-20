import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { GLOBAL_CONFIG } from "../shared/constants/global-config.constant";
import { CreateProblemRequest, ProblemSearchRequest, UpdateProblemRequest } from "./dto/problem-request.dto";
import { ProblemSearchRespond, ProblemWithUserStatus } from "./dto/problem-respond.dto";
import { Problem } from "./problem.entity";

@Injectable()
export class ProblemService {
	constructor(
		@InjectRepository(Problem)
		private readonly problemsRepository: Repository<Problem>,
		private readonly userService: UserService
	) {}

	/*
	-------------------------------------------------------
	Create Problem
	-------------------------------------------------------
	*/
	async create(createProblemRequest: CreateProblemRequest, userId: string): Promise<Problem> {
		const author = await this.userService.findOne(userId);
		const problem = this.problemsRepository.create({
			...createProblemRequest,
			author: author,
		});
		return this.problemsRepository.save(problem);
	}

	async findAll(): Promise<Problem[]> {
		return this.problemsRepository.find();
	}
	async findOne(id: number): Promise<Problem> {
		if (isNaN(id)) {
			throw new NotFoundException(`Invalid problem ID`);
		}
		const problem = await this.problemsRepository.findOneBy({ id });
		if (!problem) {
			throw new NotFoundException(`Problem with ID ${id} not found`);
		}
		return problem;
	}

	async getDetail(id: number): Promise<string> {
		const problem = await this.findOne(id);
		return problem.description || "No detail available";
	}

	async search(query: ProblemSearchRequest, user): Promise<ProblemSearchRespond> {
		const { searchText, idReverse, tag, difficulty, page = 1 } = query;
		const pageNumber = Number(page);
		const take = GLOBAL_CONFIG.DEFAULT_PROBLEM_PAGE_SIZE;
		const skip = (isNaN(pageNumber) || pageNumber < 1 ? 0 : pageNumber - 1) * take;
		const searchProblems = this.problemsRepository
			.createQueryBuilder("problem")
			.leftJoin("problem.author", "author")
			.select([
				"problem.id",
				"problem.title",
				"problem.difficulty",
				"problem.devStatus",
				"problem.tags",
				"author.name",
				"author.icon",
			]);

		if (searchText && searchText != "") {
			searchProblems.andWhere(
				"(LOWER(author.name) LIKE LOWER(:term) OR LOWER(problem.title) LIKE LOWER(:term))",
				{
					term: `%${searchText}%`,
				}
			);
		}

		if (tag && tag.length > 0) {
			searchProblems.andWhere("problem.tags && ARRAY[:...tags]", { tags: tag });
		}

		if (difficulty) {
			searchProblems.andWhere("problem.difficulty = :difficulty", { difficulty });
		}
		searchProblems
			.orderBy("problem.id", idReverse ? "DESC" : "ASC")
			.skip(skip)
			.take(take);

		const [items, total] = (await searchProblems.getManyAndCount()) as [ProblemWithUserStatus[], number];

		for (const item of items) {
			item.status = await this.userService.getProblemStatus(user.id, item.id);
		}

		return {
			items,
			pageCount: Math.ceil(total / take),
		};
	}

	async update(id: number, updateProblemRequest: UpdateProblemRequest): Promise<Problem> {
		await this.findOne(id);
		await this.problemsRepository.update(id, updateProblemRequest);
		return this.findOne(id);
	}

	async remove(id: number): Promise<Problem> {
		const problem = await this.findOne(id);
		await this.problemsRepository.delete(id);
		return problem;
	}
}
