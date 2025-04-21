import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class OpenAccountDto {
	@ApiProperty({
		description: "Email address of the user",
		example: "example@gmail.com",
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		description: "House name",
		example: "Gryffindor",
		required: false,
	})
	@IsOptional()
	@IsString()
	house: string;

	@ApiProperty({
		description: "Secret key for account creation",
		example: "secret123",
		required: false,
	})
	@IsOptional()
	@IsString()
	key: string;
}
