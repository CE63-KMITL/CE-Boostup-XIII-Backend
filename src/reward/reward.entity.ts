import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Redeem } from './redeem.entity';

@Entity('Reward')
export class Reward {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column('text', { nullable: false })
	name: string;

	@Column('int', { nullable: false })
	points: number;

	@ManyToOne(() => Redeem, (redeem) => redeem.rewardId, {
		onDelete: 'CASCADE',
	})
	redeem: Redeem[];

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;
}
