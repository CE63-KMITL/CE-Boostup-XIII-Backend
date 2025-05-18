import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/shared/enum/role.enum';
import { HouseScoreService } from './house_score.service';
import { AllowRole } from 'src/shared/decorators/auth.decorator';
import {
	CreateHouseScoreDto,
	UpdateHouseScoreDto,
} from './dtos/create-house-score.dto';
import { QueryHouseScoreDto } from './dtos/query-house-score.dto';

@ApiTags('House Score')
@Controller('houseScores')
export class HouseScoreController {
	constructor(private readonly scoreService: HouseScoreService) {}

	@Post()
	@AllowRole(Role.DEV)
	@ApiOperation({ summary: 'Create a new house score' })
	@ApiResponse({ status: 201, description: 'Score created successfully' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	async create(@Body() body: CreateHouseScoreDto) {
		try {
			return await this.scoreService.create(body.name, body.value);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	@Put(':name')
	@AllowRole(Role.STAFF)
	@ApiOperation({ summary: 'Update house score' })
	@ApiResponse({ status: 200, description: 'Score updated successfully' })
	@ApiResponse({ status: 404, description: 'House not found' })
	async update(
		@Param('name') name: string,
		@Body() body: UpdateHouseScoreDto,
	) {
		try {
			return await this.scoreService.setScore(name, body.value);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	@Get(':name')
	@AllowRole(Role.MEMBER)
	@ApiOperation({ summary: 'Get score by house name' })
	@ApiResponse({ status: 200, description: 'Returns the house score' })
	@ApiResponse({ status: 404, description: 'House not found' })
	async findOne(@Param('name') name: string) {
		try {
			return await this.scoreService.findOne(name);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	@Get()
	@AllowRole(Role.MEMBER)
	@ApiOperation({ summary: 'Get all house scores' })
	@ApiResponse({ status: 200, description: 'Returns all house scores' })
	async findAll(@Query() query: QueryHouseScoreDto) {
		try {
			return await this.scoreService.findAllSorted(query.orderBy);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	@Delete(':name')
	@AllowRole(Role.DEV)
	@ApiOperation({ summary: 'Delete house score' })
	@ApiResponse({ status: 200, description: 'Score deleted successfully' })
	@ApiResponse({ status: 404, description: 'House not found' })
	async remove(@Param('name') name: string) {
		try {
			return await this.scoreService.remove(name);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	// เพิ่มคะแนน
	@Put('add/:name')
	@AllowRole(Role.STAFF)
	async addScore(
		@Param('name') name: string,
		@Body() body: UpdateHouseScoreDto,
	) {
		try {
			return await this.scoreService.changeScore(name, body.value);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}

	// ลดคะแนน
	@Put('subtract/:name')
	@AllowRole(Role.STAFF)
	async subtractScore(
		@Param('name') name: string,
		@Body() body: UpdateHouseScoreDto,
	) {
		try {
			return await this.scoreService.changeScore(name, -body.value);
		} catch (error) {
			return { success: false, message: error.response.message };
		}
	}
}
