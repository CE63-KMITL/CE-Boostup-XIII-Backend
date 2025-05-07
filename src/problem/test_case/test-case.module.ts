import { forwardRef, Module } from '@nestjs/common';
import { TestCaseService } from './test-case.service';
import { TestCaseController } from './test-case.controller';
import { TestCase } from './test-case.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemModule } from '../problem.module';
import { RunCodeModule } from 'src/run_code/run-code.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([TestCase]),
		forwardRef(() => ProblemModule),
		forwardRef(() => RunCodeModule),
	],
	controllers: [TestCaseController],
	providers: [TestCaseService],
	exports: [TestCaseService],
})
export class TestCaseModule {}
