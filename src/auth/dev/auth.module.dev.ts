import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreLog } from 'src/user/score/score-log.entity';
import { UserModule } from 'src/user/user.module';
import { GLOBAL_CONFIG } from '../../shared/constants/global-config.constant';
import { User } from '../../user/user.entity';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { JwtStrategy } from '../jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from 'src/mail/mail.module';
import { DevAuthController } from './auth.controller.dev';
import { RolesGuard } from 'src/shared/guards/roles.guard';

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
	controllers: [DevAuthController],
	providers: [AuthService, JwtAuthGuard, RolesGuard, Reflector, JwtStrategy],
})
export class DevAuthModule {}
