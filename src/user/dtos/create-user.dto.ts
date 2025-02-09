import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
   @IsString()
   @IsNotEmpty()
   username: string;

   @IsNotEmpty()
   @IsString()
   @Exclude()
   password: string;
}
