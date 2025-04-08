import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpStatus,
  Patch,
  Delete,
  HttpCode,
  UseGuards
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { UserResponseDto } from "./dtos/user-response.dto";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard'
import {Roles} from '../auth/roles/roles.decorator'
import { Role } from '../shared/enum/role.enum'; 

@Controller("user")
@ApiTags("User")
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get all users",
    type: UserResponseDto,
    isArray: true,
  })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.userService.findAll();
  }
  @Post()
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
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get a user by id",
    type: UserResponseDto,
  })
  async findOne(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
    )
    id: string
  ): Promise<UserResponseDto> {
    const user = await this.userService.findOne(id);
    return user;
  }

  
  // @Get('by-email/:email')
  // async findOneByEmail(
  //   @Param('email') email: string
  // ): Promise<UserResponseDto> {
  //   const user = await this.userService.findOneByEmail(email);
  //   return user;
  // }


  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Update a user by id",
    type: UserResponseDto,
  })
  async update(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
    )
    id: string,
    @Body() user: UpdateUserDto
  ): Promise<UserResponseDto> {
    const responseUser = await this.userService.update(id, user);
    return responseUser;
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Delete a user by id",
  })
  async delete(
    @Param(
      "id",
      new ParseUUIDPipe({
        version: "4",
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      })
    )
    id: string
  ): Promise<void> {
    await this.userService.delete(id);
  }
}
