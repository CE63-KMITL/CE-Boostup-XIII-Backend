import { Module, DynamicModule } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ScoreLog } from 'src/user/score/score-log.entity';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';
import { GLOBAL_CONFIG } from '../shared/constants/global-config.constant';
import { User } from '../user/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles/roles.guard';
import { DevAuthController } from './auth.controller.dev';

@Module({})
export class AuthModule {
	static init(): DynamicModule {
		const controllers = [];

		if (process.env.IS_DEVELOPMENT === 'true') {
			controllers.push(DevAuthController);
		}

		return {
			module: AuthModule,
			imports: [
				JwtModule.registerAsync({
					imports: [ConfigModule],
					inject: [ConfigService],
					useFactory: (configService: ConfigService) => ({
						secret: configService.get<string>(
							GLOBAL_CONFIG.TOKEN_KEY,
						),
						signOptions: {
							expiresIn: configService.get<string>(
								GLOBAL_CONFIG.JWT_ACCESS_EXPIRATION,
							),
						},
					}),
				}),
				UserModule,
				MailModule,
				TypeOrmModule.forFeature([User, ScoreLog]),
			],
			controllers: [AuthController, ...controllers],
			providers: [
				AuthService,
				JwtAuthGuard,
				RolesGuard,
				Reflector,
				JwtStrategy,
			],
			exports: [AuthService],
		};
	}
}
