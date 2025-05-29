import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemStatus } from './problem_status/problem-status.entity';
import { ScoreLog } from './score/score-log.entity';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { HouseScoreModule } from 'src/house_score/house_score.module';
import { ProblemModule } from 'src/problem/problem.module';
import { HouseScore } from 'src/house_score/house_score.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, ScoreLog, ProblemStatus, HouseScore]),
		forwardRef(() => HouseScoreModule),
		forwardRef(() => ProblemModule),
		forwardRef(() => AuthModule),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
