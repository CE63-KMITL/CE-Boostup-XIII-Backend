import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: "john_doe",
    description: "Username",
    type: String,
  })
  username?: string;

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({
    example: "example@gmail.com",
    description: "Email",
    type: String,
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: "P@ssword1234",
    description: "Password",
    type: String,
  })
  password?: string;
}
