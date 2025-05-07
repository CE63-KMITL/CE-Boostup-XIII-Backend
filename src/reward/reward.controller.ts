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
  @AllowRole(Role.MEMBER)
  redeemReward(@Body() body: { userId: string; rewardId: string }) {
    return this.rewardService.redeemReward(body.userId, body.rewardId);
  }

  @Post('approved')
  @AllowRole(Role.STAFF)
  approveReward(@Body() body: { id: string }) {
    return this.rewardService.approveReward(body.id);
  }
  @Delete('redeem/:id/cancel')
    @AllowRole(Role.MEMBER)
    async cancelRedeem(@Param('id') id: string) {
    return this.rewardService.cancelRedeem(id);
}
}