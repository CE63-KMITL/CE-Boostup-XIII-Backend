import { User } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export type ScoreValue = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

@Entity()
export class Problem {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
	@JoinColumn({ name: "author" })
	author: User;

	@Column({
		nullable: true,
	})
	description: string;

	@Column({
		nullable: true,
	})
	default_code: string;

	@Column({
		type: "decimal",
		enum: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
		default: 2,
	})
	difficulty: ScoreValue;

	@Column("text", { array: true, nullable: true, default: [] })
	tags: string[];

	constructor(problem: Partial<Problem>) {
		Object.assign(this, problem);
	}
}
