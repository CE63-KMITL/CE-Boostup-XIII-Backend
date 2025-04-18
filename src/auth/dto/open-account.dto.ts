import { IsEmail, IsString,IsOptional } from 'class-validator';

export class OpenAccountDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  house: string;

  @IsOptional()
  @IsString()
  key: string;
}
