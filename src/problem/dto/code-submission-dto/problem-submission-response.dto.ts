import { ApiProperty } from '@nestjs/swagger';
import { RunCodeResponseDto } from 'src/run_code/dtos/run-code-response.dto';

export class ProblemSubmissionResponseDto extends RunCodeResponseDto {
	@ApiProperty({
		example: true,
		type: Boolean,
	})
	isPass: boolean;

	constructor(runCodeDto: RunCodeResponseDto, isPass: boolean) {
		super(runCodeDto);
		this.isPass = isPass;
	}
}

export class RunDraftCodeResponseDto extends RunCodeResponseDto {
	@ApiProperty({
		example: '1',
		type: String,
	})
	input: string;

	constructor(runCodeDto: RunCodeResponseDto, input: string) {
		super(runCodeDto);
		this.input = input;
	}
}
