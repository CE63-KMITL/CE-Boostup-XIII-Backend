import { ApiProperty } from "@nestjs/swagger";
import { House } from "src/shared/enum/house.enum";
import { UserResponseDto } from "src/user/dtos/user-response.dto";

export class HouseResponseDto {
	@ApiProperty({ enum: House, description: "The name of the house" })
	house: House;

	@ApiProperty({ type: [UserResponseDto], description: "List of users in the house" })
	users: UserResponseDto[];
}
