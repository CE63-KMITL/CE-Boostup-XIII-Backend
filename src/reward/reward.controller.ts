import {
	Controller,
	Get,
	Post,
	Body,
	Delete,
	Param,
	Request,
	ForbiddenException,
	ParseUUIDPipe,
	HttpStatus,
	Patch,
} from '@nestjs/common';
import { RewardService } from './reward.service';
import { Role } from '../shared/enum/role.enum';
import { AllowRole } from 'src/shared/decorators/auth.decorator';
import { authenticatedRequest } from 'src/auth/interfaces/authenticated-request.interface';
import { CreateRewardDto } from './dtos/create-reward.dto';
import { UpdateRewardDto } from './dtos/update-reward.dto';

@Controller('reward')
export class RewardController {
	constructor(private readonly rewardService: RewardService) {}

	@Get()
	getAllRewards() {
		return this.rewardService.getAllRewards();
	}

	@Post()
	@AllowRole(Role.DEV)
	async createReward(@Body() body: CreateRewardDto) {
		return this.rewardService.createReward(body);
	}

	@Patch(':id')
	@AllowRole(Role.DEV)
	async updateReward(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
		@Body() body: UpdateRewardDto,
	) {
		return this.rewardService.updateReward(id, body);
	}

	@Delete(':id')
	@AllowRole(Role.DEV)
	async deleteReward(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
	) {
		return this.rewardService.deleteReward(id);
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
	@AllowRole(Role.MEMBER)
	async getUserRewardStatus(
		@Param(
			'id',
			new ParseUUIDPipe({
				version: '4',
				errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			}),
		)
		id: string,
		@Request() req: authenticatedRequest,
	) {
		if (req.user.role === Role.MEMBER && req.user.userId !== id)
			throw new ForbiddenException();

		return this.rewardService.getUserRewardStatus(id);
	}

	@Get()
	@AllowRole(Role.MEMBER)
	async allReward() {
		return this.rewardService.getAllRewards();
	}
}
