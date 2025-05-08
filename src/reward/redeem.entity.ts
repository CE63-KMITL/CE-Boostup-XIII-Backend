import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Redeem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  rewardId: string;

  @Column({ default: true })
  isApproved: boolean;
}
