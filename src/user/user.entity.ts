import { IsEmail, IsNumber } from 'class-validator';
import { House } from 'src/shared/enum/house.enum';
import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Role } from '../shared/enum/role.enum';
import { ProblemStatus } from './problem_status/problem-status.entity';
import { ScoreLog } from './score/score-log.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true })
	name: string;

	@Column({ nullable: true })
	password: string;

	@Column({ nullable: false, unique: true })
	@IsEmail()
	email: string;

	@Column({ nullable: true, enum: House, type: 'enum' })
	house: House;

	@Column({
		nullable: false,
		enum: Role,
		type: 'enum',
		default: Role.MEMBER,
	})
	role: Role;

	@OneToMany(() => ProblemStatus, (problemStatus) => problemStatus.user)
	problemStatus: ProblemStatus[];

	@Column({ nullable: false, default: 0, type: 'decimal' })
	@IsNumber()
	score: number;

	@Column({ nullable: true, type: 'char', length: 8 })
	studentId?: string;

	@Column({ nullable: true, type: 'text' })
	icon?: string;

	@Column({ nullable: true })
	otp?: string;

	@Column({ nullable: true, type: 'timestamp' })
	otpExpires?: Date;

	@CreateDateColumn({ type: 'timestamp', nullable: false })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', nullable: false })
	updatedAt: Date;

	@OneToMany(() => ScoreLog, (scoreLog) => scoreLog.user)
	scoreLogs: ScoreLog[];

	@OneToMany(() => ScoreLog, (scoreLog) => scoreLog.modifiedBy)
	modifiedScoreLogs: ScoreLog[];
}
