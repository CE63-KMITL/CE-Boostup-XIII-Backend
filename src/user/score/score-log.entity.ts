import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user.entity";

@Entity()
export class ScoreLog {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ nullable: false })
	amount: number;

	@Column({ type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
	date: Date;

	@Column({
		type: "varchar",
		nullable: false,
		default: "system",
	})
	modifiedBy: string;

	@ManyToOne(() => User, { nullable: true })
	@JoinColumn({ name: "userId" })
	user: User;
}
