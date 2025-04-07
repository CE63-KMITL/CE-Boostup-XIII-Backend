import { Injectable, Inject, Post, Get, Patch, Delete } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Problem } from './problem.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemsRepository: Repository<Problem>,
    private readonly entityManager: EntityManager
  ) {}
  
  @Post()
  async create(createProblemDto: CreateProblemDto) {
    const problem = new Problem(createProblemDto)
    await this.entityManager.save(problem)
  }

  @Get()
  async findAll(): Promise<Problem[]> {
    return this.problemsRepository.find();
  }

  @Get(':id')
  async findOne(id: number) {
    return this.problemsRepository.findOneBy({ id });
  }

  async update(id: number, updateProblemDto: UpdateProblemDto) {
    const problem = await this.problemsRepository.update(id, updateProblemDto);
    return problem;
  }

  async remove(id: number) {
    await this.problemsRepository.delete(id);
  }
}
