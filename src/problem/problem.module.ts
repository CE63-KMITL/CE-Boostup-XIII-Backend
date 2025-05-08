import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ProblemController } from './problem.controller';
import { Problem } from './problem.entity';
import { ProblemService } from './problem.service';
import { RunCodeModule } from 'src/run_code/run-code.module';
import { TestCaseModule } from './test_case/test-case.module';
import { HouseScoreModule } from 'src/house_score/house_score.module';

@Module({
	imports: [TypeOrmModule.forFeature([Problem]), UserModule, RunCodeModule, TestCaseModule, HouseScoreModule],
	controllers: [ProblemController],
	providers: [ProblemService],
	exports: [ProblemService],
})
export class ProblemModule { }
