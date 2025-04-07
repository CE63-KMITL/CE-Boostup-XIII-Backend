import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScoreLog } from "./score/score-log.entity";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";
import { HouseScoreModule } from "../house_score/house_score.module"

@Module({
	imports: [TypeOrmModule.forFeature([User, ScoreLog])
	,HouseScoreModule
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
