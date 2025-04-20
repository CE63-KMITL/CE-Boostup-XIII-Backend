import { IsEnum, IsOptional } from "class-validator";
import { Problem } from "src/problem/problem.entity";
import { Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";

export enum ProblemStatusEnum {
	NOT_STARTED = "Not Started",
	IN_PROGRESS = "In Progress",
	DONE = "Done",
}

@Entity()
export class ProblemStatus {
	@OneToOne(() => Problem, { nullable: false })
	@JoinColumn({ name: "problem" })
	@PrimaryColumn()
	problem: Problem;

	@IsOptional()
	code: string;

	@IsOptional()
	@IsEnum(ProblemStatusEnum)
	status: ProblemStatusEnum;
}
