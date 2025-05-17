import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseScoreService } from './house_score.service';
import { HouseScoreController } from './house_score.controller';
import { HouseScore } from './house_score.entity';
import { User } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([HouseScore, User]),
		forwardRef(() => UserModule),
	],
	controllers: [HouseScoreController],
	providers: [HouseScoreService],
	exports: [HouseScoreService],
})
export class HouseScoreModule {}
