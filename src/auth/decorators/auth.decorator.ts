import { applyDecorators } from "@nestjs/common";
import { ApiHeader } from "@nestjs/swagger";

export function ApiBearerAuth() {
	return applyDecorators(
		ApiHeader({
			name: "Authorization",
			description: "Bearer token",
			required: true,
			schema: { type: "string", format: "Bearer {token}" },
		})
	);
}
