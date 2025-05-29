import { Controller, Get, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		private readonly configService: ConfigService,
	) {}

	@Get('/')
	hello(): string {
		return this.appService.hello();
	}

	//-------------------------------------------------------
	// Admin Documentation Login
	//-------------------------------------------------------
	@Get('/login')
	@HttpCode(HttpStatus.OK)
	public adminLogin(@Res({ passthrough: true }) response: Response) {
		response.setHeader(
			'WWW-Authenticate',
			'Basic realm="Admin Documentation Login"',
		);
	}
}
