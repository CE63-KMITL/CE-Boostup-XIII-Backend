import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AllowRole } from "src/auth/decorators/auth.decorator";
import { Role } from "src/shared/enum/role.enum";
import { CreateProblemRequest, ProblemSearchRequest, UpdateProblemRequest } from "./dto/problem-request.dto";
import { Problem } from "./problem.entity";
import { ProblemService } from "./problem.service";

@Controller("problem")
@ApiTags("Problem")
export class ProblemController {
	constructor(private readonly problemService: ProblemService) {}

	@ApiCreatedResponse({ type: Problem })
	@AllowRole(Role.STAFF)
	@Post()
	async create(@Body() createProblemRequest: CreateProblemRequest, @Req() req: Request) {
		const userId = (req.user as { userId: string }).userId;
		return this.problemService.create(createProblemRequest, userId);
	}

	@ApiOkResponse({ type: Problem, isArray: true })
	@AllowRole(Role.DEV)
	@Get()
	async findAll() {
		return this.problemService.findAll();
	}

	/*
	-------------------------------------------------------
	Search Problems
	-------------------------------------------------------
	*/
	@AllowRole(Role.MEMBER)
	@ApiOkResponse({
		schema: {
			properties: {
				items: {
					type: "array",
					items: { $ref: "#/components/schemas/Problem" },
				},
				pageCount: {
					type: "number",
					description: "Total number of pages",
				},
			},
		},
	})
	@ApiQuery({
		name: "searchText",
		required: false,
		description: "Search by ID or author name or problem name",
	})
	@ApiQuery({ name: "idReverse", required: false, type: "boolean", description: "Sort by ID in reverse order" })
	@ApiQuery({ name: "tag", required: false, isArray: true, description: "Filter by tags" })
	@ApiQuery({
		name: "difficulty",
		required: false,
		type: "number",
		description: "Filter by difficulty level (0.5-5)",
	})
	@ApiQuery({ name: "page", required: false, type: "number", description: "Page number (starts from 1)" })
	@Get("search")
	async search(@Query() query: ProblemSearchRequest, @Req() req) {
		return this.problemService.search(query, req.user);
	}

	@ApiOkResponse({ type: Problem })
	@AllowRole(Role.MEMBER)
	@Get(":id")
	async findOne(@Param("id") id: string) {
		return this.problemService.findOne(+id);
	}

	@ApiOkResponse({ type: String })
	@AllowRole(Role.MEMBER)
	@Get("detail/:id")
	async getDetail(@Param("id") id: string) {
		return this.problemService.getDetail(+id);
	}

	@ApiOkResponse({ type: Problem })
	@AllowRole(Role.STAFF)
	@Patch(":id")
	async update(@Param("id") id: string, @Body() updateProblemRequest: UpdateProblemRequest) {
		return this.problemService.update(+id, updateProblemRequest);
	}

	@ApiOkResponse({ type: Problem })
	@AllowRole(Role.DEV)
	@Delete(":id")
	async remove(@Param("id") id: string) {
		return this.problemService.remove(+id);
	}
}
