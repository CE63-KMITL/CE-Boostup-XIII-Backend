import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RunCodeResponseDto } from "./dtos/run_code-response.dto";
import { RunCodeService } from "./run_code.service";

@Controller("user")
@ApiTags("User")
export class RuncodeController {
	constructor(private readonly runCodeService: RunCodeService) {}

	@Post()
	Run_Code(@Body() body: { input: string; code: string; timeout: number }): Promise<RunCodeResponseDto> {
		console.log(body);
		return this.runCodeService.run_code(body.input, body.code, body.timeout);
	}
}
