import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RunCodePostDto, RunCodeResponseDto } from "./dtos/run_code.dto";
import { RunCodeService } from "./run_code.service";

@Controller("runcode")
@ApiTags("Run Code")
export class RunCodeController {
	constructor(private readonly runCodeService: RunCodeService) {}

	@Post()
	Run_Code(@Body() body: RunCodePostDto): Promise<RunCodeResponseDto> {
		console.log(body);
		return this.runCodeService.run_code(body.input, body.code, body.timeout);
	}
}
