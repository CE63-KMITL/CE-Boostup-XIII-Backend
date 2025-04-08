import { Module } from "@nestjs/common";
import { RunCodeController } from "./run_code.controller";
import { RunCodeService } from "./run_code.service";

@Module({
	controllers: [RunCodeController],
	providers: [RunCodeService],
	exports: [RunCodeService],
})
export class RunCodeModule {}
