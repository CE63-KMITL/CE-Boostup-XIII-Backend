import { UserResponseDto } from 'src/user/dtos/user-response.dto';

export class loginResponseDto {
	token: string;

	user: UserResponseDto;
}
