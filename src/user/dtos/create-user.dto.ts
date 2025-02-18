import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
} from "class-validator";
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
