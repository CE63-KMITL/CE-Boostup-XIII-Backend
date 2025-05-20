import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTestCase {
	@ApiPropertyOptional({
		example: 'sample input',
		description: 'Input for the test case',
	})
	@IsString()
	@IsOptional()
	input?: string;

	@ApiProperty({
		example: false,
		description: 'is test case hidden',
	})
	@IsBoolean()
	@IsNotEmpty()
	isHiddenTestcase: boolean;
}

export class TestCase {
	@ApiPropertyOptional({
		example: 'sample input',
		description: 'Input for the test case',
	})
	@IsString()
	@IsOptional()
	input?: string;

	@ApiProperty({
		example: 'sample output',
		description: 'expected output for the test case',
	})
	@IsString()
	@IsNotEmpty()
	expectOutput: string;

	@ApiProperty({
		example: false,
		description: 'is test case hidden',
	})
	@IsBoolean()
	@IsNotEmpty()
	isHiddenTestcase: boolean;
}
