import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class RunCodeResponseDto {
	@Expose()
	@ApiProperty({
		example: "*code output*",
		description: "code output",
		type: String,
	})
	output: string;

	@Expose()
	@ApiProperty({
		example: 0,
		description: "exit code",
		type: Number,
	})
	exit_code: number;

	@Expose()
	@ApiProperty({
		example: "*error message*",
		description: "error message",
		type: String,
	})
	error_message: string;

	@Expose()
	@ApiProperty({
		example: 0,
		description: "used time",
		type: Number,
	})
	used_time: number;
}
