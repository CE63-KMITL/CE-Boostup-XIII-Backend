import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemStatus } from 'src/user/problem_status/problem-status.entity';
import { UserModule } from 'src/user/user.module';
import { ProblemController } from './problem.controller';
import { Problem } from './problem.entity';
import { ProblemService } from './problem.service';
import { RunCodeModule } from 'src/run_code/run-code.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Problem, ProblemStatus]),
		forwardRef(() => UserModule),
		forwardRef(() => RunCodeModule),
	],
	controllers: [ProblemController],
	providers: [ProblemService],
	exports: [ProblemService],
})
export class ProblemModule {}
