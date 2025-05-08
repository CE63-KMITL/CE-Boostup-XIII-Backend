import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { RewardService } from './reward.service';
import { AllowRole } from '../auth/decorators/auth.decorator';
import { Role } from '../shared/enum/role.enum';

@Controller('rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Get()
  getAllRewards() {
    return this.rewardService.getAllRewards();
  }

  @Post('redeem')
  @AllowRole(Role.STAFF)
  redeemReward(@Body() body: { userId: string; rewardId: string }) {
    return this.rewardService.redeemReward(body.userId, body.rewardId);
  }

  @Delete('redeem/:id/cancel')
  @AllowRole(Role.STAFF)
  async cancelRedeem(@Param('id') id: string) {
    return this.rewardService.cancelRedeem(id);
  }
  @Get('user/:id/status')
  async getUserRewardStatus(@Param('id') id: string) {
    return this.rewardService.getUserRewardStatus(id);
  }
}