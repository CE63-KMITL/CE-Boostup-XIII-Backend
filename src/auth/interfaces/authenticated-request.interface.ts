import { Request } from 'express';
import { jwtPayloadDto } from '../dtos/jwt-payload.dto';

export interface authenticatedRequest extends Request {
	user: jwtPayloadDto;
}
