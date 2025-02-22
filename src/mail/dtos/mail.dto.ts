import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class sendMailDto {
  @IsEmail({}, { each: true })
  @IsNotEmpty()
  @ApiProperty({
    type: [String],
    example: ["example@gmail.com"],
    description: "Email recipients",
  })
  recipients: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Subject",
    description: "Email subject",
    type: String,
  })
  subject: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    example: "<h1>HTML Content</h1>",
    description: "Email HTML content",
    type: String,
  })
  html: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: "Text Content",
    description: "Email text content",
    type: String,
  })
  text?: string;
}
