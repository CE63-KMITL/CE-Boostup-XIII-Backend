import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
	@ApiProperty({ example: 'example@gmail.com"', description: "อีเมลของผู้ใช้" })
	@IsEmail()
	email: string;

	@ApiProperty({ example: "P@ssword1234", description: "รหัสผ่านของผู้ใช้" })
	@IsString()
	password: string;
}
