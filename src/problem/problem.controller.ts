import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';

@Controller('problem')
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Post()
  async create(@Body() createProblemDto: CreateProblemDto) {
    return this.problemService.create(createProblemDto);
  }

  @Get()
  async findAll() {
    return this.problemService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.problemService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProblemDto: UpdateProblemDto) {
    return this.problemService.update(+id, updateProblemDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.problemService.remove(+id);
  }
}
