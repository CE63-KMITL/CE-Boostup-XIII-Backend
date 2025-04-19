import { Get, Injectable, NotFoundException, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { CreateProblemDto, UpdateProblemDto } from "./dto/problem.dto";
import { Problem } from "./problem.entity";

@Injectable()
export class ProblemService {
	constructor(
		@InjectRepository(Problem)
		private readonly problemsRepository: Repository<Problem>,
		private readonly entityManager: EntityManager
	) {}

	@Post()
	async create(createProblemDto: CreateProblemDto) {
		const problem = new Problem(createProblemDto);
		await this.entityManager.save(problem);
	}

	@Get()
	async findAll(): Promise<Problem[]> {
		return this.problemsRepository.find();
	}

	@Get(":id")
	async findOne(id: number) {
		const problem = await this.problemsRepository.findOneBy({ id });
		if (!problem) {
			throw new NotFoundException(`Problem with ID ${id} not found`);
		}
		return problem;
	}

	/*
	-------------------------------------------------------
	Get Problem Detail
	-------------------------------------------------------
	*/
	async getDetail(id: number): Promise<string> {
		const problem = await this.findOne(id);
		return problem.description;
	}

	/*
	-------------------------------------------------------
	Update Problem
	-------------------------------------------------------
	*/
	async update(id: number, updateProblemDto: UpdateProblemDto) {
		const problem = await this.problemsRepository.update(id, updateProblemDto);
		return problem;
	}

	async remove(id: number) {
		await this.problemsRepository.delete(id);
	}
}
