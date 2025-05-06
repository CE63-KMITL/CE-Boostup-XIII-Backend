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
