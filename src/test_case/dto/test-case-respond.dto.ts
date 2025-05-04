import { ApiProperty, PartialType } from '@nestjs/swagger';


export class TestCaseResultRespond {
    @ApiProperty()
    status: "Pass" | "Not Pass" | "Error";

    @ApiProperty()
    message: string;

    @ApiProperty()
    exitCode: number;
}