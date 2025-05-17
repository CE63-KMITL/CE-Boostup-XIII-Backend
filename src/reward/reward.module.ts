import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { Redeem } from './redeem.entity';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/user.entity';
import { Reward } from './reward.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Redeem, User, Reward]),
		forwardRef(() => UserModule),
	],
	controllers: [RewardController],
	providers: [RewardService],
})
export class RewardModule {}
