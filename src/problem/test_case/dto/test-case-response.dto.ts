import { ApiProperty } from '@nestjs/swagger';
import { TestCase } from '../test-case.object';

export class TestCaseResponseDto {
	@ApiProperty({
		example: 'abc',
		description: 'test case input',
		nullable: true,
	})
	input: string;

	@ApiProperty({
		example: 'abc',
		description: 'expected output',
	})
	expectOutput: string;

	@ApiProperty({
		example: true,
		description: 'is test case hidden',
	})
	isHiddenTestcase: boolean;

	constructor(testCase: TestCase) {
		Object.assign(this, testCase);
	}
}
