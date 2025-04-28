import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('/')
	Home_Page(): string {
		return this.appService.Home_Page();
	}
}
