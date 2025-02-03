import { Injectable } from "@nestjs/common";

type RunCodeResult = {
	output: string;
	exit_code: number;
	error_message: string;
	used_time: number;
};

@Injectable()
export class RunCodeService {
	static async run_code(input: string, code: string, timeout: number = 100): Promise<RunCodeResult | Response> {
		const result = await fetch("http://CE-Boostup-XIII-Compiler:3002/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				input: input,
				code: code,
				timeout: timeout,
			}),
		});

		if (!result.ok) {
			console.log("Error: ", result);
			return result;
		}

		return await result.json();
	}
}
