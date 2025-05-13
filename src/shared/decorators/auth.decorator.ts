import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtPublicAuthGuard, JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enum/role.enum';
import { RolesGuard } from '../guards/roles.guard';

export function AllowRole(...args: Role[]) {
	let guardResult: MethodDecorator[] = [ApiBearerAuth('access-token')];

	if (args.length == 0) {
		guardResult = [...guardResult, UseGuards(JwtPublicAuthGuard)];
	} else {
		guardResult = [
			...guardResult,
			UseGuards(JwtAuthGuard, RolesGuard),
			Roles(...args),
			ApiOperation({
				summary: `⚠️ Only Allowed to ${JSON.stringify(args)}`,
			}),
		];
	}

	return applyDecorators(...guardResult);
}
