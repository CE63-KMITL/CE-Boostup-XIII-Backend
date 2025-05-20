import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('houseScore')
export class HouseScore {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true, nullable: false })
	name: String;

	@Column({ type: 'int', default: 0 })
	value: number;

	@CreateDateColumn({ type: 'timestamp', nullable: false })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: false })
	updatedAt: Date;
}
