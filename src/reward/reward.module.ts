import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';
import { Redeem } from './redeem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Redeem])],
  controllers: [RewardController],
  providers: [RewardService],
})
export class RewardModule {}