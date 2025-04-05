import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ScoreLog } from './score-log.entity';

@Module({
   imports: [TypeOrmModule.forFeature([User, ScoreLog])],
   controllers: [UserController],
   providers: [UserService],
   exports: [UserService],
})
export class UserModule {}
