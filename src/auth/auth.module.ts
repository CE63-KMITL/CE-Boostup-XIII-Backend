import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { User } from '../user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { GLOBAL_CONFIG } from '../shared/constants/global-config.constant';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles/roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';
import { ScoreLog } from 'src/user/score/score-log.entity';


@Module({
  imports: [
    JwtModule.register({
      secret: GLOBAL_CONFIG.TOKEN_KEY || 'qwertyuiop', // ✅ ต้องมีค่า!
      signOptions: { expiresIn: '1d' }, // ตั้งอายุ token ได้
    }),
    UserModule,
    TypeOrmModule.forFeature([User, ScoreLog]),
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtAuthGuard,
    RolesGuard,
    Reflector,JwtStrategy],
})
export class AuthModule {}

