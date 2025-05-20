import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { GLOBAL_CONFIG } from '../shared/constants/global-config.constant';
import { jwtPayloadDto } from './dtos/jwt-payload.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: configService.get<string>(GLOBAL_CONFIG.TOKEN_KEY),
		});
	}

	async validate(payload: jwtPayloadDto) {
		return payload; // จะกลายเป็น req.user
	}
}
