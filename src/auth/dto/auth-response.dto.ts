import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/user/dtos/user-response.dto';

export class AuthResponseDto {
	@ApiProperty({
		description: 'access token',
		example: 'jltroijnvoiwoiio',
		type: String,
	})
	token: string;

	@ApiProperty({
		description: 'user response',
		type: UserResponseDto,
	})
	user: UserResponseDto;
}
