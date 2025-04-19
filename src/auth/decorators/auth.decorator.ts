import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { Role } from "src/shared/enum/role.enum";
import { JwtAuthGuard } from "../jwt-auth.guard";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";

export function AllowRole(...args: Role[]) {
	return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...args), ApiBearerAuth("access-token"));
}
