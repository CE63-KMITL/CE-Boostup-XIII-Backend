import { ApiProperty } from '@nestjs/swagger';
import { TestCase } from '../test-case.entity';

export class TestCaseResponseDto {
	@ApiProperty({
		example: '92d62009-a247-40e9-a901-928c8a9b5a40',
		description: 'id of test case',
	})
	id: string;

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
		this.id = testCase.id;
		this.input = testCase.input;
		this.expectOutput = testCase.expectOutput;
		this.isHiddenTestcase = testCase.isHiddenTestcase;
	}
}
