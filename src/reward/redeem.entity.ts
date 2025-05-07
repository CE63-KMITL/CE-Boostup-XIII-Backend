import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Redeem {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  rewardId: string;

  @Column({ default: false })
  isApproved: boolean;
}
