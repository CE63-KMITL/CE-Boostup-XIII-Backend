import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, IsNumber } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: "john_doe",
    description: "name",
    type: String,
  })
  name?: string;

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({
    example: "example@gmail.com",
    description: "Email",
    type: String,
  })
  email?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    example: 100,
    description: "User score",
    type: Number,
  })
  score?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: "P@ssword1234",
    description: "Password",
    type: String,
  })
  password?: string;
}
