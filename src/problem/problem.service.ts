import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/user.entity";
import { Repository } from "typeorm";
import { GLOBAL_CONFIG } from "../shared/constants/global-config.constant";
import { CreateProblemDto, ProblemSearchDto, UpdateProblemDto } from "./dto/problem.dto";
import { Problem } from "./problem.entity";

@Injectable()
export class ProblemService {
	constructor(
		@InjectRepository(Problem)
		private readonly problemsRepository: Repository<Problem>,
		@InjectRepository(User) // Inject UserRepository
		private readonly usersRepository: Repository<User>
	) {}

	/*
	-------------------------------------------------------
	Create Problem
	-------------------------------------------------------
	*/
	async create(createProblemDto: CreateProblemDto, userId: string): Promise<Problem> {
		// Add userId parameter
		const author = await this.usersRepository.findOneBy({ id: userId });
		if (!author) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}
		const problem = this.problemsRepository.create({
			...createProblemDto,
			author: author, // Assign the found user as the author
		});
		return this.problemsRepository.save(problem);
	}

	async findAll(): Promise<Problem[]> {
		return this.problemsRepository.find();
	}

	async findOne(id: number): Promise<Problem> {
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

	async search(query: ProblemSearchDto) {
		console.log(query);
		const { searchText, idReverse, tag, difficulty, page = 1 } = query;
		const pageNumber = Number(page);
		const take = GLOBAL_CONFIG.DEFAULT_PROBLEM_PAGE_SIZE;
		const skip = (isNaN(pageNumber) || pageNumber < 1 ? 0 : pageNumber - 1) * take;

		console.log(
			"searchText",
			searchText,
			"idReverse",
			idReverse,
			"tag",
			tag,
			"difficulty",
			difficulty,
			"take",
			take,
			"skip",
			skip
		);

		const result = this.problemsRepository
			.createQueryBuilder("problem")
			.leftJoinAndSelect("problem.author", "author");

		if (searchText) {
			result.andWhere("(LOWER(author.name) LIKE LOWER(:term) OR LOWER(problem.name) LIKE LOWER(:term))", {
				term: `%${searchText}%`,
			});
		}

		if (tag && tag.length > 0) {
			result.andWhere("problem.tags && ARRAY[:...tags]", { tags: tag });
		}

		if (difficulty) {
			result.andWhere("problem.difficulty = :difficulty", { difficulty });
		}

		result
			.orderBy("problem.id", idReverse ? "DESC" : "ASC")
			.skip(skip)
			.take(take);

		const [items, total] = await result.getManyAndCount();

		return {
			items,
			pageCount: Math.ceil(total / take),
		};
	}

	async update(id: number, updateProblemDto: UpdateProblemDto): Promise<Problem> {
		await this.findOne(id);
		await this.problemsRepository.update(id, updateProblemDto);
		return this.findOne(id);
	}

	async remove(id: number): Promise<Problem> {
		const problem = await this.findOne(id);
		await this.problemsRepository.delete(id);
		return problem;
	}
}
