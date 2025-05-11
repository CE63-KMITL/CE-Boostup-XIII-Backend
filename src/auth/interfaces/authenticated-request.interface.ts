import { Request } from 'express';
import { jwtPayloadDto } from '../dto/jwt-payload.dto';

export interface authenticatedRequest extends Request {
	user: jwtPayloadDto;
}
