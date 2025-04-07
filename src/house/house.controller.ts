import { Controller, Get, HttpCode, HttpStatus, Param } from "@nestjs/common"; // Added Param
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { House } from "src/shared/enum/house.enum";
import { HouseResponseDto } from "./dtos/house-response.dto"; // Import the new DTO
import { HouseService } from "./house.service";

@Controller("house")
@ApiTags("House")
export class UserController {
	// Consider renaming UserController to HouseController if appropriate
	constructor(private readonly houseService: HouseService) {}

	@Get(":house")
	@HttpCode(HttpStatus.OK)
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Get all users in a specific house", // Updated description
		type: HouseResponseDto, // Use the new DTO
		isArray: true, // Remove isArray if HouseResponseDto represents the whole response object
	})
	// Add @Param('house') decorator to capture the route parameter
	async findAll(@Param("house") house: House): Promise<string[]> {
		// return only users id
		return (await this.houseService.get_all_users_in_house(house)).map((user) => user.id);
	}
}
