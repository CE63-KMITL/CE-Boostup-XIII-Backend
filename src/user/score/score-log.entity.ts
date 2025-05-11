import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user.entity";
import { IsString } from "class-validator";

@Entity()
export class ScoreLog {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ nullable: false })
	amount: number;

	@Column({ type: "timestamp", nullable: false, default: () => "CURRENT_TIMESTAMP" })
	date: Date;

	@ManyToOne(() => User, { nullable: true })
	@JoinColumn({ name: "userId" })
	user: User;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: "modifiedBy" })
	modifiedBy: User;

	@IsString()
	@Column({ nullable: false })
	message: string;
}
