import { Role } from 'src/shared/enum/role.enum';
export class jwtPayloadDto {
	userId: string;
	role: Role;
	email: string;
}
