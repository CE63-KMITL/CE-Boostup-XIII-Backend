import { Body, Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { RunCodeService } from "./run_code/run_code.service";

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get("/")
	Home_Page(): string {
		return this.appService.Home_Page();
	}

	@Post("/run_code")
	Run_Code(@Body() body: { input: string; code: string; timeout: number }): Promise<any> {
		console.log(body);
		return RunCodeService.run_code(body.input, body.code, body.timeout);
	}
}
