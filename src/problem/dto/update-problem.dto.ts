import { IsOptional } from "class-validator"

export class UpdateProblemDto {
    @IsOptional()
    title: string
    @IsOptional()
    description: string
    @IsOptional()
    default_code: string
    @IsOptional()
    difficulty: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5
    @IsOptional()
    tags: string[]
}