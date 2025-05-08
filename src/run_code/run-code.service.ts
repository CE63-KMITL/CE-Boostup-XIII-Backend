import { Injectable } from '@nestjs/common';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';
import { RunCodeResponseDto } from './dtos/run-code-response.dto';
import { ConfigService } from '@nestjs/config';
import { RunCodeExitStatusEnum } from './enum/run-code-exit-status.enum';

@Injectable()
export class RunCodeService {
	constructor(private readonly configService: ConfigService) {}
	async runCode(
		input: string,
		code: string,
		timeout: number,
	): Promise<RunCodeResponseDto> {
		const result = await fetch(
			`http://${this.configService.getOrThrow<string>(GLOBAL_CONFIG.COMPILER_HOST)}/`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					input: input,
					code: code,
					timeout: timeout,
				}),
			},
		);

		if (!result.ok) {
			console.log('Error: ', result);
			return {
				output: '',
				exit_code: 1,
				exit_status: RunCodeExitStatusEnum.CANT_CONNECT_TO_COMPILER,
				error_message: 'Error running code',
				used_time: -1,
			};
		}

		return await result.json();
	}
}
