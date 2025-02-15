import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class sendMailDto {
   @IsEmail({}, { each: true })
   @IsNotEmpty()
   recipients: string[];

   @IsString()
   @IsNotEmpty()
   subject: string;

   @IsString()
   @IsNotEmpty()
   html: string;

   @IsOptional()
   @IsString()
   text?: string;
}
