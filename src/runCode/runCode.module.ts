import { Module } from '@nestjs/common';
import { RunCodeController } from './runCode.controller';
import { RunCodeService } from './runCode.service';

@Module({
	controllers: [RunCodeController],
	providers: [RunCodeService],
	exports: [RunCodeService],
})
export class RunCodeModule {}
