import { IsEnum, IsOptional } from "class-validator";
import { Problem } from "src/problem/problem.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "../user.entity";

export enum ProblemStatusEnum {
	NOT_STARTED = "Not Started",
	IN_PROGRESS = "In Progress",
	DONE = "Done",
}

@Entity()
export class ProblemStatus {
	@PrimaryColumn()
	userId: number;

	@PrimaryColumn()
	problemId: number;

	@ManyToOne(() => User, (user) => user.problemStatus, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user: User;

	@ManyToOne(() => Problem, (problem) => problem, { onDelete: "CASCADE" })
	@JoinColumn({ name: "problemId" })
	problem: Problem;

	@Column({ type: "text", nullable: true })
	@IsOptional()
	code: string;

	@IsEnum(ProblemStatusEnum)
	@IsOptional()
	status: ProblemStatusEnum;

	@Column({ type: "timestamp", nullable: true })
	lastSubmitted: Date;

	constructor(partial: Partial<ProblemStatus>) {
		Object.assign(this, partial);
	}
}
