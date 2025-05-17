import { User } from 'src/user/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Reward } from './reward.entity';

@Entity()
export class Redeem {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	@ManyToOne(() => User, (user) => user.redeem, {
		onDelete: 'CASCADE',
	})
	userId: string;

	@Column()
	@ManyToOne(() => Reward, (reward) => reward.redeem, {
		onDelete: 'CASCADE',
	})
	rewardId: string;

	@Column({ default: true })
	isApproved: boolean;
}
