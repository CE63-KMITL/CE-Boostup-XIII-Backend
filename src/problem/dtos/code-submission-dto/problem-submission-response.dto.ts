import { ApiProperty } from '@nestjs/swagger';
import { TestCase } from 'src/problem/test_case/test-case.object';
import { RunCodeResponseDto } from 'src/run_code/dtos/run-code-response.dto';

export class ProblemSubmissionResponseDto extends RunCodeResponseDto {
	@ApiProperty({
		example: true,
		type: Boolean,
	})
	isPass: boolean;

	constructor(testCaseDto: TestCase, runCodeDto: RunCodeResponseDto) {
		super(runCodeDto);
		this.isPass = testCaseDto.expectOutput.trim() === this.output.trim();
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
