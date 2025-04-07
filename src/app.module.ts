import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HouseModule } from "./house/house.module";
import { HouseScoreModule } from "./house_score/house_score.module";
import { MailModule } from "./mail/mail.module";
import { ProblemModule } from "./problem/problem.module";
import { RunCodeModule } from "./run_code/run_code.module";
import { databaseConfig } from "./shared/configs/databaseconfig";
import { dotenvConfig } from "./shared/configs/dotenv.config";
import { GLOBAL_CONFIG } from "./shared/constants/global-config.constant";
import { UserModule } from "./user/user.module";

@Module({
	imports: [
		UserModule,
		ProblemModule,
		MailModule,
		RunCodeModule,
		HouseModule,
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema: dotenvConfig,
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				...databaseConfig,
				autoLoadEntities: true,
				synchronize: configService.get<boolean>(GLOBAL_CONFIG.IS_DEVELOPMENT),
			}),
			inject: [ConfigService],
		}),
		HouseScoreModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
