import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from 'src/shared/enum/role.enum';

export class AutoSendMailDto {
	@ApiPropertyOptional({
		type: String,
		enum: Role,
	})
	@IsEnum(Role)
	role: Role;
}
