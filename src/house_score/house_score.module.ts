import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseScoreService } from './house_score.service';
import { HouseScoreController } from './house_score.controller';
import { HouseScore } from './house_score.entity';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [TypeOrmModule.forFeature([HouseScore]), UserModule],
	controllers: [HouseScoreController],
	providers: [HouseScoreService],
	exports: [HouseScoreService],
})
export class HouseScoreModule {}
