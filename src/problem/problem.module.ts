import { Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';
import { Problem } from './entities/problem.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
