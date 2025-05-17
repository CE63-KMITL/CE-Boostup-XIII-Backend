import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redeem } from './redeem.entity';
import { User } from '../user/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Reward } from './reward.entity';
import { Role } from 'src/shared/enum/role.enum';
import { CreateRewardDto } from './dtos/create-reward.dto';
import { UpdateRewardDto } from './dtos/update-reward.dto';

//Ex .env
//REWARDS=[{"id":1,"name":"แก้วน้ำ","points":100},{"id":2,"name":"เสื้อยืด","points":250}]

@Injectable()
export class RewardService {
	constructor(
		@InjectRepository(User)
		public readonly userRepo: Repository<User>,

		@InjectRepository(Redeem)
		private redeemRepo: Repository<Redeem>,

		@InjectRepository(Reward)
		private readonly rewardRepo: Repository<Reward>,
	) {}

	async getAllRewards() {
		return await this.rewardRepo.find();
	}

	async createReward(createRewardDto: CreateRewardDto) {
		return await this.rewardRepo.save(createRewardDto);
	}

	async updateReward(id: string, update: UpdateRewardDto) {
		const reward = await this.rewardRepo.findOne({ where: { id } });
		if (!reward) throw new NotFoundException('Reward not found');
		await this.rewardRepo.update(id, update);
		return await this.rewardRepo.findOne({ where: { id } });
	}

	async deleteReward(id: string) {
		const reward = await this.rewardRepo.findOne({ where: { id } });
		if (!reward) throw new NotFoundException('Reward not found');
		await this.rewardRepo.delete(id);
	}

	async redeemReward(userId: string, rewardId: string) {
		const user = await this.userRepo.findOneBy({ id: userId });
		if (!user) throw new NotFoundException('User not found');
		if (user.role !== Role.MEMBER)
			throw new BadRequestException('Do not redeem it!');
		const reward = await this.rewardRepo.findOne({
			where: { id: rewardId },
		});

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
		const redeem = await this.redeemRepo.findOne({
			where: { rewardId: id },
		});
		if (!redeem) {
			throw new NotFoundException('Redeem not found');
		}

		await this.redeemRepo.delete(redeem.id);

		return {
			success: true,
			message: 'Redeem canceled successfully',
		};
	}

	async getUserRewardStatus(userId: string) {
		const user = await this.userRepo.findOne({
			where: { id: userId },
			relations: { redeem: true },
		});
		if (!user) throw new NotFoundException('User not found');

		const redeemdId = user.redeem.map((redeem) => redeem.rewardId);
		const rewards = await this.rewardRepo.find();
		const availableRewards = rewards.filter((reward) => {
			if (
				reward.points <= user.score &&
				!redeemdId.includes(reward.id)
			)
				return reward;
		});
		const lockedRewards = rewards.filter((reward) => {
			if (reward.points > user.score && !redeemdId.includes(reward.id))
				return reward;
		});

		const result = {
			redeemed: await Promise.all(
				user.redeem.map((redeem) =>
					this.rewardRepo.findOneBy({ id: redeem.rewardId }),
				),
			),
			available: availableRewards,
			locked: lockedRewards,
		};

		return {
			success: true,
			message: 'get redeem successfully',
			data: result,
		};
	}
}
