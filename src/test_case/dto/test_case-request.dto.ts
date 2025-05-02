import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class CreateTestCaseRequest {
    @ApiProperty()
    @IsString()
    expectOutput: string;

    @ApiProperty()
    @IsBoolean()
    hiddenTestcase: boolean;

}

export class UpdateTestCaseRequest extends PartialType(CreateTestCaseRequest) { }