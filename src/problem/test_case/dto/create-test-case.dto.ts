import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTestCaseDto {
	@ApiProperty({
		example: 'abc',
		type: String,
		nullable: true,
	})
	@IsOptional()
	@IsString()
	input?: string;

	@ApiProperty({
		example: true,
		type: Boolean,
	})
	@IsBoolean()
	@IsNotEmpty()
	isHiddenTestcase: boolean;
}

export class UpdateTestCaseDto extends PartialType(CreateTestCaseDto) {}
