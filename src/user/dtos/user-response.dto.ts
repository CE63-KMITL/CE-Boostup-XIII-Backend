import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { House } from "src/shared/enum/house.enum";
import { Role } from "../../shared/enum/role.enum";

export class UserResponseDto {
	@Expose()
	@ApiProperty({
		example: "f789f66d-8e8e-4df0-9d12-c6aeaf930ce6",
		description: "User uuid",
		type: String,
	})
	id: string;

	@Expose()
	@ApiProperty({
		example: "john_doe",
		description: "name",
		type: String,
	})
	name: string;

	@Exclude()
	password: string;

	@Expose()
	@ApiProperty({
		example: "example@gmail.com",
		description: "Email",
		type: String,
	})
	email: string;

	@Expose()
	@ApiProperty({
		example: House.BARBARIAN,
		description: "User house",
		enum: House,
	})
	house: House;

	@Expose()
	@ApiProperty({
		example: Role.MEMBER,
		description: "User role",
		enum: Role,
	})
	role: Role;

	@Expose()
	@ApiProperty({
		example: 0,
		description: "User score",
		type: Number,
	})
	score: number;

	@Expose()
	@ApiProperty({
		example: "2021-09-29T13:43:18.000Z",
		description: "User creation date",
		type: Date,
	})
	createdAt: Date;

	@Expose()
	@ApiProperty({
		example: "2021-09-29T13:43:18.000Z",
		description: "User update date",
		type: Date,
	})
	updatedAt: Date;
}
