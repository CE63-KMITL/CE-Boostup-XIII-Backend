import { Injectable, Inject } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Problem } from './entities/problem.entity';
import { CreateProblemDto } from './dto/create-problem.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProblemService {
  constructor(
    @InjectRepository(Problem)
    private readonly problemsRepository: Repository<Problem>,
    private readonly entityManager: EntityManager
  ) {}
  
  async create(createProblemDto: CreateProblemDto) {
    const problem = new Problem(createProblemDto)
    await this.entityManager.save(problem)
  }

  async findAll(): Promise<Problem[]> {
    return this.problemsRepository.find();
  }

  async findOne(id: number) {
    return this.problemsRepository.findOneBy({ id });
  }

  update(id: number, updateProblemDto: UpdateProblemDto) {
    const problem = await this.problemsRepository.findOneBy({ id });
    // TODO: Update problem
    return this.entityManager.save(problem);
  }

  async remove(id: number) {
    await this.problemsRepository.delete(id);
  }
}
