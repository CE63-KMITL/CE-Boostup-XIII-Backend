import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseScoreService } from './house_score.service';
import { HouseScoreController } from './house_score.controller';
import { HouseScore } from './house_score.entity';
import { User } from 'src/user/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([HouseScore, User])],
	controllers: [HouseScoreController],
	providers: [HouseScoreService],
	exports: [HouseScoreService],
})
export class HouseScoreModule {}
