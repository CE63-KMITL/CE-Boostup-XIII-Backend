import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HouseModule } from './house/house.module';
import { MailModule } from './mail/mail.module';
import { ProblemModule } from './problem/problem.module';
import { RunCodeModule } from './runCode/runCode.module';
import { databaseConfig } from './shared/configs/databaseconfig';
import { dotenvConfig } from './shared/configs/dotenv.config';
import { GLOBAL_CONFIG } from './shared/constants/global-config.constant';
import { CustomThrottlerGuard } from './shared/guards/throttler.guard';
import { UserModule } from './user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { TestCaseModule } from './test_case/test_case.module';

@Module({
	imports: [
		UserModule,
		ProblemModule,
		TestCaseModule,
		MailModule,
		RunCodeModule,
		HouseModule,
		AuthModule,
		ThrottlerModule.forRoot([
			{
				ttl: 10000,
				limit: 50,
			},
		]),
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: dotenvConfig,
		}),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				connection: {
					host: configService.getOrThrow<string>(
						GLOBAL_CONFIG.REDIS_HOST,
					),
					port: 6379,
				},
			}),
			inject: [ConfigService],
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				...databaseConfig,
				autoLoadEntities: true,
				synchronize: configService.get<boolean>(
					GLOBAL_CONFIG.IS_DEVELOPMENT,
				),
			}),
			inject: [ConfigService],
		}),
		TestCaseModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: CustomThrottlerGuard,
		},
	],
})
export class AppModule { }
