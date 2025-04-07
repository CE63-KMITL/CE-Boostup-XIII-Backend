import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class RunCodePostDto {
	@ApiProperty({ description: "Input for the code execution", example: "1 2" })
	@IsString()
	@IsOptional()
	input: string;

	@ApiProperty({ description: "The code to be executed", example: "print(sum(map(int, input().split())))" })
	@IsString()
	code: string;

	@ApiProperty({ description: "Timeout for the code execution in milliseconds", example: 1000 })
	@IsNumber()
	@IsOptional()
	timeout: number;
}
