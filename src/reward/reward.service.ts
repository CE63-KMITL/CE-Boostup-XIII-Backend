import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Redeem } from './redeem.entity';
import { HouseScore } from '../house_score/house_score.entity';
import { User } from '../user/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

//Ex .env
//REWARDS=[{"id":1,"name":"แก้วน้ำ","points":100},{"id":2,"name":"เสื้อยืด","points":250}]

@Injectable()
export class RewardService {
  private rewards: { id: string; name: string; points: number }[];

  constructor(
    private configService: ConfigService,
    @InjectRepository(Redeem)
    @InjectRepository(HouseScore)
    @InjectRepository(User)
    private readonly houseScoreRepo: Repository<HouseScore>,
    public readonly userRepo: Repository<User>,
    private redeemRepo: Repository<Redeem>,
  ) {
    const rewardsString = this.configService.get<string>('REWARDS');
    this.rewards = rewardsString ? JSON.parse(rewardsString) : [];
  }

  getAllRewards() {
    return this.rewards;
  }

  async redeemReward(userId: string, rewardId: string) {
    const reward = this.rewards.find(r => r.id === rewardId);
    let id=userId
    if (!reward) {
        throw new NotFoundException('Reward not found');
    }
    const user = await this.userRepo.findOne({ where: { id } });
    if(!user){
        throw new BadRequestException('User not found');
    }

    let amount = user.score - reward.points

    if (amount<0){
        throw new BadRequestException('Insufficient score');
    }
    await this.userRepo.update(userId,{score : amount})

    //ลบคะเเนนบ้าน
    let name = user.house
    const house = await this.houseScoreRepo.findOne({ where: { name } })
    amount = house.value - reward.points
    await this.houseScoreRepo.update(house.id,{value : amount})
    const redeem = this.redeemRepo.create({ userId, rewardId,isApproved: false });
    
    
    return {
        success: true,
        message: "Redeem created successfully",
        data:this.redeemRepo.save(redeem)
        };
    }

  async approveReward(id:string){
    const reward = await this.redeemRepo.findOne({ where:{ id } })
    if (!reward){
        throw new NotFoundException('Reward not found')
    }
    if (reward.isApproved){
        throw new BadRequestException('The reward is approved');
    }
    await this.redeemRepo.update(id, { isApproved: true });
    return {
        success: true,
        message: "Redeem created successfully",
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
    const reward = this.rewards.find(r => r.id === redeem.rewardId);
   
    id = redeem.userId
    const user = await this.userRepo.findOne({ where: { id } });
    let amount = user.score+reward.points
    await this.userRepo.update(id,{score : amount})

    return { 
        success: true,
        message: 'Redeem canceled successfully'
    };
  }
}