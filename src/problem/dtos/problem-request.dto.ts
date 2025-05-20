import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class ProblemRunCodeRequest {
	@ApiProperty({
		description: 'Input for the code execution',
		example: '1 2',
	})
	@IsString()
	@IsOptional()
	input: string;

	@ApiProperty({
		description: 'Code to be executed',
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
		required: false,
	})
	@IsString()
	@IsNotEmpty()
	code: string;
}
