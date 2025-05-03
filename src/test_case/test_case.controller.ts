import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TestCaseService } from './test_case.service';
import { CreateTestCaseRequest, UpdateTestCaseRequest } from './dto/test_case-request.dto';

@Controller('test_case')
export class TestCaseController {
  constructor(private readonly testCaseService: TestCaseService) { }

  @Post()
  async create(@Body() createTestCaseRequest: CreateTestCaseRequest) {
    return this.testCaseService.create(createTestCaseRequest);
  }

  @Get()
  async findAll() {
    return this.testCaseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.testCaseService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTestCaseRequest: UpdateTestCaseRequest) {
    return this.testCaseService.update(+id, updateTestCaseRequest);
  }

  @Delete(':id')
  asyncremove(@Param('id') id: string) {
    return this.testCaseService.remove(+id);
  }
}
