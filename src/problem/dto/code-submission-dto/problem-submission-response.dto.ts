import { ApiProperty } from '@nestjs/swagger';
import { RunCodeResponseDto } from 'src/runCode/dtos/runCode.dto';

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
