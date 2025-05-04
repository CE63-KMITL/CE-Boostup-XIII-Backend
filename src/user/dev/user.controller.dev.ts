import {
	Body,
	Controller,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from 'src/shared/enum/role.enum';
import { CreateUserDto } from '../dtos/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from '../user.service';
import { AllowRole } from 'src/auth/decorators/auth.decorator';

@ApiTags('User (DEV)')
@Controller('dev/user/')
export class DevUserController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
	) {}

	@Post('create')
	@AllowRole(Role.DEV)
	async createUser(
		@Body() body: CreateUserDto,
	): Promise<{ message: string; id: string }> {
		const user = await this.userService.create(body);
		return { message: 'User created successfully', id: user.id };
	}

	/*
	-------------------------------------------------------
	Set Role Endpoint
	-------------------------------------------------------
	*/
	@Post('update/:id')
	@AllowRole(Role.DEV)
	async setRole(
		@Body() body,
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
	): Promise<{ message: string }> {
		console.log(body);
		if (body.password) {
			body.password = await this.authService.setPassword(
				id,
				body.password,
			);
			delete body.password;
		}
		await this.userService.update(id, body);
		return { message: 'User data set successfully' };
	}
}
