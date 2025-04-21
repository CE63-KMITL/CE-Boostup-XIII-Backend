import { IsEmail, IsNumber, IsOptional } from "class-validator";
import { House } from "src/shared/enum/house.enum";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../shared/enum/role.enum";
import { ProblemStatus } from "./score/problem-status.entity";
import { ScoreLog } from "./score/score-log.entity";

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ nullable: true })
	@IsOptional()
	studentId: string;

	@Column({ nullable: true })
	@IsOptional()
	icon: string;

	@Column({ nullable: false, unique: true })
	name: string;

	@Column({ nullable: false })
	password: string;

	@Column({ nullable: false, unique: true })
	@IsEmail()
	email: string;

	@Column({ nullable: true, enum: House, type: "enum" })
	house: House;

	@Column({ nullable: false, enum: Role, type: "enum" })
	role: Role;

	@OneToMany(() => ProblemStatus, (problemStatus) => problemStatus.user)
	problemStatus: ProblemStatus[];

	@Column({ nullable: false, default: 0 })
	@IsNumber()
	score: number;

	@CreateDateColumn({ type: "timestamp", nullable: false })
	createdAt: Date;

	@UpdateDateColumn({ type: "timestamp", nullable: false })
	updatedAt: Date;

	@OneToMany(() => ScoreLog, (scoreLog) => scoreLog.user)
	scoreLogs: ScoreLog[];

	@OneToMany(() => ScoreLog, (scoreLog) => scoreLog.modifiedBy)
	modifiedScoreLogs: ScoreLog[];
}
