import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemStatus } from '../problem_status/problem-status.entity';
import { ScoreLog } from '../score/score-log.entity';
import { User } from '../user.entity';
import { UserService } from '../user.service';
import { DevUserController } from './user.controller.dev';
import { AuthService } from 'src/auth/auth.service';
import { MailModule } from 'src/mail/mail.module';
import { HouseScoreModule } from 'src/house_score/house_score.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, ScoreLog, ProblemStatus]),
		HouseScoreModule,
		MailModule,
	],
	controllers: [DevUserController],
	providers: [UserService, AuthService],
})
export class DevUserModule {}
