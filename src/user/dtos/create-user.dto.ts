import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { House } from "src/shared/enum/house.enum";
import { AvailableRoles, Role } from "src/shared/enum/role.enum";

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		example: "john_doe",
		description: "name",
		type: String,
	})
	name: string;

	@IsEmail()
	@IsNotEmpty()
	@ApiProperty({
		example: "example@gmail.com",
		description: "Email",
		type: String,
	})
	email: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty({
		example: "P@ssword1234",
		description: "Password",
		type: String,
	})
	password: string;

	@IsNotEmpty()
	@IsEnum(House, {
		message: `House must be a valid enum value.`,
	})
	@ApiProperty({
		example: House.House1,
		description: "User house",
		enum: House,
		type: String,
		default: House.NONE,
	})
	house: House;

	@IsOptional()
	@IsEnum(AvailableRoles, {
		message: `Role must be a valid enum value: ${Role.DEV} or ${Role.MEMBER}`,
	})
	@ApiPropertyOptional({
		example: Role.MEMBER,
		description: "User role",
		enum: Role,
		type: String,
		default: Role.MEMBER,
	})
	role: Role;
}
