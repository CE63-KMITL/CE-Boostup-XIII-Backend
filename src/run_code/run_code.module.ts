import { Module } from "@nestjs/common";
import { RunCodeService } from "./run_code.service";

@Module({
	providers: [RunCodeService],
})
export class Run_Code_Module {}
