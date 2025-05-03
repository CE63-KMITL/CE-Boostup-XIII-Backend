import { Module } from '@nestjs/common';
import { TestCaseService } from './test_case.service';
import { TestCaseController } from './test_case.controller';
import { TestCase } from './test_case.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TestCase])],
  controllers: [TestCaseController],
  providers: [TestCaseService],
  exports: [TestCaseService]
})
export class TestCaseModule { }
