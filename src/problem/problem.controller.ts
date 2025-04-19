import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Roles } from "src/auth/roles/roles.decorator";
import { RolesGuard } from "src/auth/roles/roles.guard";
import { Role } from "src/shared/enum/role.enum";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProblemDto, ProblemSearchDto, UpdateProblemDto } from "./dto/problem.dto";
import { Problem } from "./problem.entity";
import { ProblemService } from "./problem.service";

@Controller("problem")
@ApiTags("Problem")
export class ProblemController {
	constructor(private readonly problemService: ProblemService) {}

	/*
	-------------------------------------------------------
	Create Problem
	-------------------------------------------------------
	*/
	@ApiCreatedResponse({ type: Problem })
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Post()
	async create(@Body() createProblemDto: CreateProblemDto, @Req() req: Request) {
		const userId = (req.user as { userId: string }).userId;
		return this.problemService.create(createProblemDto, userId);
	}

	@ApiOkResponse({ type: Problem, isArray: true })
	@Get()
	async findAll() {
		return this.problemService.findAll();
	}

	/*
	-------------------------------------------------------
	Search Problems
	-------------------------------------------------------
	*/
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
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
	async search(@Query() query: ProblemSearchDto) {
		console.log("not pass", query);
		return this.problemService.search(query);
	}

	@ApiOkResponse({ type: Problem })
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@Get(":id")
	async findOne(@Param("id") id: string) {
		return this.problemService.findOne(+id);
	}

	@ApiOkResponse({ type: String })
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.MEMBER)
	@ApiBearerAuth()
	@Get("detail/:id")
	async getDetail(@Param("id") id: string) {
		return this.problemService.getDetail(+id);
	}

	@ApiOkResponse({ type: Problem })
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.MEMBER)
	@ApiBearerAuth()
	@Patch(":id")
	async update(@Param("id") id: string, @Body() updateProblemDto: UpdateProblemDto) {
		return this.problemService.update(+id, updateProblemDto);
	}

	@ApiOkResponse({ type: Problem })
	@Delete(":id")
	async remove(@Param("id") id: string) {
		return this.problemService.remove(+id);
	}
}
