import { Injectable } from '@nestjs/common';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';
import { RunCodeResponseDto } from './dtos/run-code-response.dto';

@Injectable()
export class RunCodeService {
	async runCode(
		input: string,
		code: string,
		timeout: number = 100,
	): Promise<RunCodeResponseDto> {
		const result = await fetch(`http://${GLOBAL_CONFIG.COMPILER_HOST}/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				input: input,
				code: code,
				timeout: timeout,
			}),
		});

		if (!result.ok) {
			console.log('Error: ', result);
			return {
				output: '',
				exit_code: 1,
				error_message: 'Error running code',
				used_time: -1,
			};
		}

		return await result.json();
	}
}
