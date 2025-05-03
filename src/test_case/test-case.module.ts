import { Module } from '@nestjs/common';
import { TestCaseService } from './test-case.service';
import { TestCaseController } from './test-case.controller';
import { TestCase } from './test-case.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([TestCase])],
	controllers: [TestCaseController],
	providers: [TestCaseService],
	exports: [TestCaseService],
})
export class TestCaseModule {}
