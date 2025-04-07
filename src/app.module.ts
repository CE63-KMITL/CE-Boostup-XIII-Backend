import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dotenvConfig } from './shared/configs/dotenv.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './shared/configs/databaseconfig';
import { GLOBAL_CONFIG } from './shared/constants/global-config.constant';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';
import { ProblemModule } from './problem/problem.module';

@Module({
   imports: [
      UserModule,
      ProblemModule,
      MailModule,
      ConfigModule.forRoot({
         isGlobal: true,
         validationSchema: dotenvConfig,
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
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule { }
