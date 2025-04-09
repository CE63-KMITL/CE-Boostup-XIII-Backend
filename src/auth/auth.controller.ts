import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles/roles.guard';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import {Roles} from './roles/roles.decorator'
import { Role } from '../shared/enum/role.enum'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }

  @Post('login')
  async login(@Body()logindata: LoginDto){
    return this.authService.login(logindata);
  }
  //for test
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEV)
  @Get('dev')
  getAdminOnly() {
    return "You are dev!";
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER)
  @Get('member')
  getMenberOnly() {
    return "You are dev!";
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER,Role.DEV)
  @Get('all')
  getall() {
    return "everyone can see this(except admin)";
  }
}
