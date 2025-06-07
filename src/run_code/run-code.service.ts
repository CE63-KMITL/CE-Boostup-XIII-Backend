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
		const escapeRegExp = (string: string): string => {
			return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		};

		if (functions.length > 0) {
			const foundAnyListedFunction = functions.some((func) =>
				new RegExp(`\\b${func}\\s*\\(`).test(codeString),
			);

			if (
				functionMode === ProblemAllowMode.DISALLOWED &&
				foundAnyListedFunction
			) {
				throw new BadRequestException(
					`Your code should not contain disallowed functions: ${functions.join(
						', ',
					)}`,
				);
			}

			if (functionMode === ProblemAllowMode.DISALLOWED) {
				for (const func of functions) {
					const escapedFunc = escapeRegExp(func);
					if (
						new RegExp(`\\b${escapedFunc}\\s*\\(`).test(
							codeString,
						)
					) {
						throw new BadRequestException(
							`Usage of disallowed function '${func}' is not permitted. Disallowed functions: ${functions.join(', ')}.`,
						);
					}

					const defineAliasRegex = new RegExp(
						`#define\\s+(\\w+)\\s+${escapedFunc}\\b`,
						'g',
					);
					let match;
					while (
						(match = defineAliasRegex.exec(codeString)) !==
						null
					) {
						const alias = match[1];
						if (
							new RegExp(`\\b${alias}\\s*\\(`).test(
								codeString,
							)
						) {
							throw new BadRequestException(
								`Usage of disallowed function '${func}' via alias '${alias}' is not permitted. Disallowed functions: ${functions.join(', ')}.`,
							);
						}
					}
				}
			} else if (functionMode === ProblemAllowMode.ALLOWED) {
				const foundAtLeastOneRequiredFunction = functions.some(
					(func) =>
						new RegExp(
							`\\b${escapeRegExp(func)}\\s*\\(`,
						).test(codeString),
				);
				if (!foundAtLeastOneRequiredFunction) {
					throw new BadRequestException(
						`Your code must use at least one of the following functions: ${functions.join(', ')}.`,
					);
				}
			}
		}

		if (headers.length > 0) {
			if (headerMode === ProblemAllowMode.DISALLOWED) {
				for (const header of headers) {
					const escapedHeader = escapeRegExp(header);
					if (
						new RegExp(
							`#include\\s*[<"]${escapedHeader}[>"]`,
							'g',
						).test(codeString)
					) {
						throw new BadRequestException(
							`Usage of disallowed header '${header}' is not permitted. Disallowed headers: ${headers.join(', ')}.`,
						);
					}

					const defineFullHeaderRegex = new RegExp(
						`#define\\s+(\\w+)\\s+(<${escapedHeader}>|"${escapedHeader}")`,
						'g',
					);
					let matchFull;
					while (
						(matchFull =
							defineFullHeaderRegex.exec(codeString)) !==
						null
					) {
						const alias = matchFull[1];
						if (
							new RegExp(
								`#include\\s*${alias}\\b`,
								'g',
							).test(codeString)
						) {
							throw new BadRequestException(
								`Usage of disallowed header '${header}' via alias '${alias}' (defined as <${header}> or "${header}") is not permitted. Disallowed headers: ${headers.join(', ')}.`,
							);
						}
					}

					const defineHeaderNameRegex = new RegExp(
						`#define\\s+(\\w+)\\s+${escapedHeader}\\b`,
						'g',
					);
					let matchName;
					while (
						(matchName =
							defineHeaderNameRegex.exec(codeString)) !==
						null
					) {
						const alias = matchName[1];
						if (
							new RegExp(
								`#include\\s*[<"]${alias}[>"]`,
								'g',
							).test(codeString)
						) {
							throw new BadRequestException(
								`Usage of disallowed header '${header}' via alias '${alias}' (defined as '${header}', used in #include <${alias}> or "${alias}") is not permitted. Disallowed headers: ${headers.join(', ')}.`,
							);
						}
					}
				}
			} else if (headerMode === ProblemAllowMode.ALLOWED) {
				const foundAtLeastOneRequiredHeader = headers.some(
					(header) =>
						new RegExp(
							`#include\\s*[<"]${escapeRegExp(header)}[>"]`,
							'g',
						).test(codeString),
				);
				if (!foundAtLeastOneRequiredHeader) {
					throw new BadRequestException(
						`Your code must include at least one of the following headers: ${headers.join(', ')}.`,
					);
				}
			}
		}
	}
}
