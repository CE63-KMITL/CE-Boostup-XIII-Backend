import { Request } from 'express';
import { Role } from 'src/shared/enum/role.enum';

export interface authenticatedRequest extends Request {
	user: { userId: string; role: Role; email: string };
}
