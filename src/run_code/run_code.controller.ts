import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RunCodePostDto, RunCodeResponseDto } from "./dtos/run_code.dto";
import { RunCodeService } from "./run_code.service";

@Controller("runcode")
@ApiTags("Run Code")
export class RunCodeController {
	constructor(private readonly runCodeService: RunCodeService) {}

	@Post()
	@ApiOperation({ summary: "Run code with input" })
	@ApiResponse({
		status: 200,
		description: "Code executed successfully",
		type: RunCodeResponseDto,
	})
	@ApiResponse({ status: 400, description: "Bad Request" })
	@ApiResponse({ status: 500, description: "Code execution failed" })
	Run_Code(@Body() body: RunCodePostDto): Promise<RunCodeResponseDto> {
		console.log(body);
		return this.runCodeService.run_code(body.input, body.code, body.timeout);
	}
}
