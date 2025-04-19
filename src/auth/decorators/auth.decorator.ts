import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiHeader } from "@nestjs/swagger";
import { Role } from "src/shared/enum/role.enum";
import { JwtAuthGuard } from "../jwt-auth.guard";
import { Roles } from "../roles/roles.decorator";
import { RolesGuard } from "../roles/roles.guard";

export function AllowRole(...args: Role[]) {
	return applyDecorators(
		UseGuards(JwtAuthGuard, RolesGuard),
		Roles(...args),
		ApiHeader({
			name: "Authorization",
			description: "Bearer token",
			required: true,
			schema: { type: "string", format: "Bearer {token}" },
		})
	);
}
