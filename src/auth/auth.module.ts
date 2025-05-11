import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreLog } from 'src/user/score/score-log.entity';
import { UserModule } from 'src/user/user.module';
import { GLOBAL_CONFIG } from '../shared/constants/global-config.constant';
import { User } from '../user/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from 'src/mail/mail.module';

@Module({
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>(GLOBAL_CONFIG.TOKEN_KEY),
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
	controllers: [AuthController],
	providers: [AuthService, JwtAuthGuard, RolesGuard, Reflector, JwtStrategy],
})
export class AuthModule {}
