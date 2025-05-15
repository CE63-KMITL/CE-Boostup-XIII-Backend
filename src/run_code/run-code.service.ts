import { BadRequestException, Injectable } from '@nestjs/common';
import { GLOBAL_CONFIG } from 'src/shared/constants/global-config.constant';
import { RunCodeResponseDto } from './dtos/run-code-response.dto';
import { ConfigService } from '@nestjs/config';
import { RunCodeExitStatusEnum } from './enum/run-code-exit-status.enum';
import { ProblemAllowMode } from 'src/problem/enums/problem-allow-mode.enum';

@Injectable()
export class RunCodeService {
	constructor(private readonly configService: ConfigService) {}
	async runCode({
		input,
		code,
		timeout,
		functionMode = ProblemAllowMode.DISALLOWED,
		headerMode = ProblemAllowMode.DISALLOWED,
		headers = [],
		functions = [],
		skipCheck = false,
	}): Promise<RunCodeResponseDto> {
		if (!skipCheck) {
			await this.checkAllowCode({
				codeString: code,
				functions,
				headers,
				functionMode,
				headerMode,
			});
		}

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
				used_time: -1,
			};
		}

		return await result.json();
	}

	async runCodeMultipleInputs({
		code,
		inputs,
		timeout,
		functionMode = ProblemAllowMode.DISALLOWED,
		headerMode = ProblemAllowMode.DISALLOWED,
		headers = [],
		functions = [],
	}): Promise<RunCodeResponseDto[]> {
		this.checkAllowCode({
			codeString: code,
			functions,
			headers,
			functionMode,
			headerMode,
		});

		const result = [];

		for (const input of inputs) {
			result.push(
				this.runCode({
					input,
					code,
					timeout,
					skipCheck: true,
				}),
			);
		}

		return Promise.all(result);
	}

	checkAllowCode({
		codeString,
		functions = [],
		headers = [],
		functionMode = ProblemAllowMode.DISALLOWED,
		headerMode = ProblemAllowMode.DISALLOWED,
	}) {
		if (functions.length > 0) {
			const foundAnyListedFunction = functions.some((func) =>
				new RegExp(`\\b${func}\\s*\\(`).test(codeString),
			);

			if (
				functionMode === ProblemAllowMode.DISALLOWED &&
				foundAnyListedFunction
			) {
				throw new BadRequestException(
					`Your code should not contains functions ${functions.join(
						', ',
					)}`,
				);
			} else if (
				functionMode === ProblemAllowMode.ALLOWED &&
				!foundAnyListedFunction
			) {
				throw new BadRequestException(
					`Your code must contains functions ${functions.join(
						', ',
					)}`,
				);
			}
		}
		if (headers.length > 0) {
			const foundAnyListedHeader = headers.some((header) =>
				new RegExp(`#include\\s*[<"]${header}[>"]`, 'g').test(
					codeString,
				),
			);
			if (
				headerMode === ProblemAllowMode.DISALLOWED &&
				foundAnyListedHeader
			) {
				throw new BadRequestException(
					`Your code should not contains headers ${headers.join(', ')}`,
				);
			} else if (
				headerMode === ProblemAllowMode.ALLOWED &&
				!foundAnyListedHeader
			) {
				throw new BadRequestException(
					`Your code must contains headers ${headers.join(', ')}`,
				);
			}
		}
	}
}
