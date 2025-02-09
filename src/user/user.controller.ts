import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Controller('user')
export class UserController {
   constructor(private readonly userService: UserService) {}

   @Get()
   async findAll(): Promise<any> {
      return await this.userService.findAll();
   }
   @Post()
   async reate(@Body() user: CreateUserDto): Promise<any> {
      const reponseUser = await this.userService.create(user);
      return reponseUser;
   }
}
