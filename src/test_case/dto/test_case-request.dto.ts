import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateTestCaseRequest {
    @ApiProperty()
    expectOutput: string

    @ApiProperty()
    hiddenTestcase: boolean

}

export class UpdateTestCaseRequest extends PartialType(CreateTestCaseRequest) { }