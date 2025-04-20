import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { ProblemStatusEnum } from "src/user/score/problem-status.entity";
import { ProblemStaffStatus } from "../problem.entity";

export class CreateProblemRequest {
	@ApiProperty({ example: "Sample Problem Title" })
	title: string;

	@ApiProperty({ example: "Sample problem description" })
	description: string;

	@ApiProperty({ example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}' })
	default_code: string;

	@ApiProperty({ example: 3, description: "Difficulty level (0.5 to 5)" })
	difficulty: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

	@ApiProperty({ example: ["math", "algorithm"] })
	tags: string[];
}

export class UpdateProblemRequest {
	@ApiProperty({ example: "Updated Problem Title", required: false })
	@IsOptional()
	title: string;

	@ApiProperty({ example: "Updated problem description", required: false })
	@IsOptional()
	description: string;

	@ApiProperty({
		example: '#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!");\n\treturn 0;\n}',
		required: false,
	})
	@IsOptional()
	default_code: string;

	@ApiProperty({ example: 4, description: "Updated difficulty level (0.5 to 5)", required: false })
	@IsOptional()
	difficulty: 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

	@ApiProperty({ example: ["meme", "algorithm"], required: false })
	@IsOptional()
	tags: string[];
}

enum ProblemSearchSortBy {
	ASC = "ASC",
	DESC = "DESC",
}

export class ProblemSearchRequest {
	@IsOptional()
	@IsString()
	searchText: string;

	@IsOptional()
	@IsString()
	idReverse: string;

	@IsOptional()
	@IsString()
	tags: string;

	@IsOptional()
	@IsString()
	minDifficulty: string = "0.5";

	@IsOptional()
	@IsString()
	maxDifficulty: string = "5";

	@IsOptional()
	@IsString()
	status: ProblemStatusEnum | ProblemStaffStatus;

	@IsOptional()
	@IsString()
	page: string = "1";

	@IsOptional()
	@IsString()
	@IsEnum(ProblemSearchSortBy)
	difficultySortBy: ProblemSearchSortBy = ProblemSearchSortBy.ASC;
}
