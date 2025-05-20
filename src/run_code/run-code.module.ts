import { Module } from '@nestjs/common';
import { RunCodeService } from './run-code.service';
import { RunCodeController } from './run-code.controller';

@Module({
	controllers: [RunCodeController],
	providers: [RunCodeService],
	exports: [RunCodeService],
})
export class RunCodeModule {}
