import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTestCaseRequest, UpdateTestCaseRequest } from './dto/test_case-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TestCase } from './test_case.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TestCaseService {
  constructor(
    @InjectRepository(TestCase)
    private readonly testCaseRepository: Repository<TestCase>
  ) { }

  async create(createTestCaseRequest: CreateTestCaseRequest): Promise<TestCase> {
    const testCase = await this.testCaseRepository.create(createTestCaseRequest)
    return testCase;
  }

  async findAll(): Promise<TestCase[]> {
    const allTestCases = await this.testCaseRepository.find();
    return allTestCases;
  }

  async findOne(id: number): Promise<TestCase> {
    if (isNaN(id)) {
      throw new NotFoundException(`Invalid test case ID`);
    }
    const testCase = await this.testCaseRepository.findOneBy({ id });
    if (!testCase) {
      throw new NotFoundException(`Test case with ID ${id} not found`);
    }
    return testCase;
  }

  async update(id: number, updateTestCaseRequest: UpdateTestCaseRequest): Promise<TestCase> {
    const testCase = this.findOne(id);
    await this.testCaseRepository.update(id, updateTestCaseRequest)
    return testCase;
  }

  async remove(id: number): Promise<TestCase> {
    const testCase = await this.findOne(id);
    await this.testCaseRepository.delete(id);
    return testCase;
  }
}
