import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProblemRequestSubmissionDto {
	@ApiProperty({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
	})
	@IsNotEmpty()
	@IsString()
	code: string;
}

export class ProblemSubmissionDto {
	@ApiProperty({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
	})
	@IsNotEmpty()
	@IsString()
	code: string;

	constructor({ code }: { code: string }) {
		this.code = code;
	}
}
