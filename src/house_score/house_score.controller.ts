import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/auth/roles/roles.decorator";
import { RolesGuard } from "src/auth/roles/roles.guard";
import { Role } from "src/shared/enum/role.enum";
import { ApiBearerAuth } from "../auth/decorators/auth.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { HouseScoreService } from "./house_score.service";

@ApiTags("House Score")
@Controller("houseScores")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HouseScoreController {
	constructor(private readonly scoreService: HouseScoreService) {}

	@Post()
	@ApiOperation({ summary: "Create a new house score" })
	@ApiResponse({ status: 201, description: "Score created successfully" })
	@ApiResponse({ status: 400, description: "Bad request" })
	async create(@Body() body: { name: string; value: number }) {
		try {
			return await this.scoreService.create(body.name, body.value);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	@Put(":name")
	@ApiOperation({ summary: "Update house score" })
	@ApiResponse({ status: 200, description: "Score updated successfully" })
	@ApiResponse({ status: 404, description: "House not found" })
	async update(@Param("name") name: string, @Body() body: { value: number }) {
		try {
			return await this.scoreService.changeScore(name, body.value);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	@Get(":name")
	@ApiOperation({ summary: "Get score by house name" })
	@ApiResponse({ status: 200, description: "Returns the house score" })
	@ApiResponse({ status: 404, description: "House not found" })
	async findOne(@Param("name") name: string) {
		try {
			return await this.scoreService.findOne(name);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	@Get()
	@ApiOperation({ summary: "Get all house scores" })
	@ApiResponse({ status: 200, description: "Returns all house scores" })
	async findAll(@Query("order") order?: "ASC" | "DESC") {
		try {
			return order ? await this.scoreService.findAllSorted(order) : await this.scoreService.findAll();
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	@Delete(":name")
	@ApiOperation({ summary: "Delete house score" })
	@ApiResponse({ status: 200, description: "Score deleted successfully" })
	@ApiResponse({ status: 404, description: "House not found" })
	async remove(@Param("name") name: string) {
		try {
			return await this.scoreService.remove(name);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	// เพิ่มคะแนน
	@Put("add/:name")
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.STAFF)
	async addScore(@Param("name") name: string, @Body() body: { value: number }) {
		try {
			return await this.scoreService.addScore(name, body.value);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	// ลดคะแนน
	@Put("subtract/:name")
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(Role.STAFF)
	async subtractScore(@Param("name") name: string, @Body() body: { value: number }) {
		try {
			return await this.scoreService.subtractScore(name, body.value);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}
}
