import { Controller, Get, Post, Body, UseGuards,HttpCode,HttpStatus,Query } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles/roles.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {CreateUserDto} from '../user/dtos/create-user.dto'
import { Roles } from './roles/roles.decorator';
import { Role } from '../shared/enum/role.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {UserResponseDto} from '../user/dtos/user-response.dto';
import { UserService } from 'src/user/user.service';
import { OpenAccountDto } from './dto/open-account.dto';

@ApiTags('Auth') // จัดกลุ่มใน Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly userService: UserService) {}

  @Post('openaccount')
  async openAccount(@Query() query: OpenAccountDto) {
    return this.authService.openAccount(query);
  }
    

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: "Create a new user",
		type: UserResponseDto,
	})
  async create(@Body() user: CreateUserDto): Promise<UserResponseDto> {
      const reponseUser = await this.userService.create(user);
      return reponseUser;
    }

  @Post('login')
  @ApiOperation({
    description: 'Login with email and password'
  })
  @ApiResponse({
    status: 201,
    description: 'login success',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user:{
          id:'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          email:'user@example.com',
          name:'user'
        }
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Wrong email or password',
  })
  async login(@Body() logindata: LoginDto) {
    return this.authService.login(logindata);
  }

  // for test
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEV)
  @Get('dev')
  getAdminOnly() {
    return 'You are dev!';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER)
  @Get('member')
  getMenberOnly() {
    return 'You are dev!';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MEMBER, Role.DEV)
  @Get('all')
  getall() {
    return 'everyone can see this(except admin)';
  }
}
