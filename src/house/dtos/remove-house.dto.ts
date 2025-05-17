import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemoveHouseDto {
	@ApiProperty({ description: 'Email of the user to remove from house' })
	@IsString()
	email: string;
}
