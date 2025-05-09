import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redeem } from './redeem.entity';
import { User } from '../user/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

//Ex .env
//REWARDS=[{"id":1,"name":"แก้วน้ำ","points":100},{"id":2,"name":"เสื้อยืด","points":250}]

@Injectable()
export class RewardService {
	private rewards: { id: string; name: string; points: number }[];

	constructor(
		private configService: ConfigService,

		@InjectRepository(User)
		public readonly userRepo: Repository<User>,

		@InjectRepository(Redeem)
		private redeemRepo: Repository<Redeem>,
	) {
		this.rewards = this.configService.getOrThrow('REWARDS');
	}

	getAllRewards() {
		return this.rewards;
	}

	// async redeemReward(userId: string, rewardId: string) {
	//   const reward = this.rewards.find(r => r.id === rewardId);
	//   let id=userId
	//   if (!reward) {
	//       throw new NotFoundException('Reward not found');
	//   }
	//   const user = await this.userRepo.findOne({ where: { id } });
	//   if(!user){
	//       throw new NotFoundException('User not found');
	//   }

	//   if (user.score<reward.points){
	//       throw new BadRequestException('Insufficient score');
	//   }

	//   const redeem = this.redeemRepo.create({ userId, rewardId,isApproved: false });

	//   user.rewards.push({ redeemId: redeem.id,rewardId:rewardId});
	//   await this.userRepo.save(user);

	//   return {
	//       success: true,
	//       message: "Redeem created successfully",
	//       data:this.redeemRepo.save(redeem)
	//       };
	//   }
	async redeemReward(userId: string, rewardId: string) {
		const user = await this.userRepo.findOneBy({ id: userId });
		const reward = this.rewards.find((r) => r.id === rewardId);

		if (!user || !reward) throw new NotFoundException();

		if (user.score < reward.points) {
			throw new BadRequestException('คะแนนไม่เพียงพอ');
		}

		const alreadyRedeemed = await this.redeemRepo.findOneBy({
			userId: userId,
			rewardId: rewardId,
		});

		if (alreadyRedeemed) {
			throw new BadRequestException('คุณแลกของชิ้นนี้ไปแล้ว');
		}

		const redeem = this.redeemRepo.create({ userId, rewardId });

		return {
			success: true,
			message: 'Redeem created successfully',
			data: this.redeemRepo.save(redeem),
		};
	}

	async cancelRedeem(id: string) {
		const redeem = await this.redeemRepo.findOneBy({ id });
		if (!redeem) {
			throw new NotFoundException('Redeem not found');
		}

		if (redeem.isApproved) {
			throw new BadRequestException('Cannot cancel this redeem');
		}

		await this.redeemRepo.delete(id);

		return {
			success: true,
			message: 'Redeem canceled successfully',
		};
	}

	async getUserRewardStatus(userId: string) {
		const user = await this.userRepo.findOneBy({ id: userId });
		if (!user) throw new NotFoundException('User not found');

		const redeemed = await this.redeemRepo.find({
			where: { userId },
		});

		const redeemedIds = new Set(redeemed.map((r) => r.rewardId));

		const result = {
			redeemed: [],
			available: [],
			locked: [],
		};

		for (const reward of this.rewards) {
			if (redeemedIds.has(reward.id)) {
				result.redeemed.push(reward);
			} else if (user.score >= reward.points) {
				result.available.push(reward);
			} else {
				result.locked.push(reward);
			}
		}

		return {
			success: true,
			message: 'get redeem successfully',
			data: result,
		};
	}
}
