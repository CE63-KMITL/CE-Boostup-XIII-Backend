import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from 'src/shared/enum/role.enum';
import { JwtAuthGuard, JwtPublicAuthGuard } from '../jwt-auth.guard';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

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
