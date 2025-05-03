import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateTestCaseDto {
	@ApiProperty({
		example: 'abc',
		type: String,
	})
	@IsString()
	@IsNotEmpty()
	expectOutput: string;

	@ApiProperty({
		example: true,
		type: Boolean,
	})
	@IsBoolean()
	@IsNotEmpty()
	isHiddenTestcase: boolean;
}

export class UpdateTestCaseDto extends PartialType(CreateTestCaseDto) {}
