import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CreateProblemDto, UpdateProblemDto } from "./dto/problem.dto";
import { Problem } from "./problem.entity";
import { ProblemService } from "./problem.service";

@Controller("problem")
@ApiTags("Problem")
export class ProblemController {
	constructor(private readonly problemService: ProblemService) {}

	@ApiCreatedResponse({ type: Problem })
	@Post()
	async create(@Body() createProblemDto: CreateProblemDto) {
		return this.problemService.create(createProblemDto);
	}

	@ApiOkResponse({ type: Problem, isArray: true })
	@Get()
	async findAll() {
		return this.problemService.findAll();
	}

	@ApiOkResponse({ type: Problem })
	@Get(":id")
	async findOne(@Param("id") id: string) {
		return this.problemService.findOne(+id);
	}

	@ApiOkResponse({ type: Problem })
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
