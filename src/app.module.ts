import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProblemModule } from './problem/problem.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './shared/configs/databaseconfig';
import { dotenvConfig } from './shared/configs/dotenv.config';
import { GLOBAL_CONFIG } from './shared/constants/global-config.constant';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: dotenvConfig,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...databaseConfig,
        autoLoadEntities: true,
        synchronize: configService.get<boolean>(
          GLOBAL_CONFIG.IS_DEVELOPMENT,
        ),
      }),
    }),
    UserModule,
    ProblemModule,
    MailModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}