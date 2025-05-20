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
import { RunCodeModule } from './run_code/run-code.module';
import { databaseConfig } from './shared/configs/databaseconfig';
import { dotenvConfig } from './shared/configs/dotenv.config';
import { GLOBAL_CONFIG } from './shared/constants/global-config.constant';
import { UserModule } from './user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { HouseScoreModule } from './house_score/house_score.module';
import { DevUserModule } from './user/dev/user.module.dev';
import { DevAuthModule } from './auth/dev/auth.module.dev';
import { RewardModule } from './reward/reward.module';
import { ThrottlerBehindProxyGuard } from './shared/guards/custom-throttle.guard';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';

const imports = [
	UserModule,
	ProblemModule,
	MailModule,
	RunCodeModule,
	HouseModule,
	HouseScoreModule,
	AuthModule,
	RewardModule,
	ThrottlerModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (configService: ConfigService) => ({
			throttlers: [{ ttl: 10000, limit: 50 }],
			storage: new ThrottlerStorageRedisService({
				host: configService.getOrThrow<string>(
					GLOBAL_CONFIG.REDIS_HOST,
				),
				port: 6379,
			}),
		}),
	}),
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
	RedisModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (configService: ConfigService) => ({
			config: {
				host: configService.getOrThrow<string>(
					GLOBAL_CONFIG.REDIS_HOST,
				),
				port: 6379,
			},
		}),
	}),
];

if (process.env.IS_DEVELOPMENT === 'true') {
	imports.push(DevUserModule);
	imports.push(DevAuthModule);
}

@Module({
	imports,
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerBehindProxyGuard,
		},
	],
})
export class AppModule {}
