import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemStatus } from './problem_status/problem-status.entity';
import { ScoreLog } from './score/score-log.entity';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { UserService } from './user.service';
import { HouseScoreModule } from 'src/house_score/house_score.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, ScoreLog, ProblemStatus]),
		HouseScoreModule,
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
