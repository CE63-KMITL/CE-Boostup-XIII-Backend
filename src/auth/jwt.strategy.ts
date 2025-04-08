import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { GLOBAL_CONFIG } from '../shared/constants/global-config.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: GLOBAL_CONFIG.TOKEN_KEY,
    });
  }

  async validate(payload: any) {
    return payload; // จะกลายเป็น req.user
  }
}
