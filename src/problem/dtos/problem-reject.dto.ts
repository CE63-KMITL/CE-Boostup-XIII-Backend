import { IsOptional, IsString } from "class-validator";

export class RejectProblemDTO {
    @IsOptional()
    @IsString()
    message?: string
}