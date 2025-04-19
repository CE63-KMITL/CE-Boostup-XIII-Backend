import { Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScoreLog } from "src/user/score/score-log.entity";
import { UserModule } from "src/user/user.module";
import { GLOBAL_CONFIG } from "../shared/constants/global-config.constant";
import { User } from "../user/user.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";
import { RolesGuard } from "./roles/roles.guard";

@Module({
	imports: [
		JwtModule.register({
			secret: GLOBAL_CONFIG.TOKEN_KEY || "qwertyuiop", // ✅ ต้องมีค่า!
			signOptions: { expiresIn: "1d" }, // ตั้งอายุ token ได้
		}),
		UserModule,
		TypeOrmModule.forFeature([User, ScoreLog]),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtAuthGuard, RolesGuard, Reflector, JwtStrategy],
})
export class AuthModule {}
