import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseScoreService } from './house_score.service';
import { HouseScoreController } from './house_score.controller';
import { HouseScore } from './house_score.entity';

@Module({
	imports: [TypeOrmModule.forFeature([HouseScore])],
	controllers: [HouseScoreController],
	providers: [HouseScoreService],
})
export class HouseScoreModule {}
