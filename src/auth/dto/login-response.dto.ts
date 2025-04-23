import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from 'src/user/dtos/user-response.dto';

export class loginResponseDto {
	@ApiProperty({
		description: 'access token',
		type: String,
	})
	token: string;

	@ApiProperty({
		description: 'user response',
		type: UserResponseDto,
	})
	user: UserResponseDto;
}
