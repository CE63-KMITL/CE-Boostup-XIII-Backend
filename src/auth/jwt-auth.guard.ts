// jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtPublicAuthGuard extends AuthGuard('jwt') {
	handleRequest(err, user, info, context) {
		return user;
	}
}
