import { Injectable } from '@nestjs/common';
import { RunCodeResponseDto } from './dtos/runCode.dto';

@Injectable()
export class RunCodeService {
	async runCode(
		input: string,
		code: string,
		timeout: number = 100,
	): Promise<RunCodeResponseDto> {
		const result = await fetch('http://localhost:3002/', {
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
