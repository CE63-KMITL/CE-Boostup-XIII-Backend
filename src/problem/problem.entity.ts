import { IsEnum } from 'class-validator';
import { User } from 'src/user/user.entity';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ProblemStaffStatusEnum } from './enum/problem-staff-status.enum';
import { ScoreValue } from './type/score-value.type';
import { TestCase } from 'src/problem/test_case/test-case.entity';
import { ProblemAllowMode } from './enum/problem-allow-mode.enum';

@Entity()
export class Problem {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ unique: true, nullable: false })
	title: string;

	@ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'author' })
	author: User;

	@Column({
		nullable: true,
	})
	description?: string;

	@Column({
		nullable: false,
		default: 100000,
	})
	timeLimit: number;

	@Column({
		nullable: false,
		default: ProblemAllowMode.DISALLOWED,
		enum: ProblemAllowMode,
	})
	@IsEnum(ProblemAllowMode)
	headerMode: ProblemAllowMode;

	@Column('text', { nullable: true, array: true })
	headers: string[];

	@Column({
		nullable: false,
		default: ProblemAllowMode.DISALLOWED,
		enum: ProblemAllowMode,
	})
	@IsEnum(ProblemAllowMode)
	functionMode: ProblemAllowMode;

	@Column('text', { nullable: true, array: true })
	functions: string[];

	@Column({
		nullable: true,
	})
	defaultCode?: string;

	@Column({
		nullable: false,
	})
	solutionCode: string;

	@Column({
		type: 'decimal',
		enum: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
		nullable: false,
		default: 2,
	})
	difficulty: ScoreValue;

	@Column({
		nullable: false,
		default: ProblemStaffStatusEnum.IN_PROGRESS,
		enum: ProblemStaffStatusEnum,
	})
	@IsEnum(ProblemStaffStatusEnum)
	devStatus: ProblemStaffStatusEnum;

	@Column('text', { array: true, nullable: true, default: [] })
	tags: string[];

	@Column('text', { array: true, nullable: true, default: [] })
	@Column({
		nullable: true,
		type: 'text',
	})
	rejectedMessage?: string;

	@OneToMany(() => TestCase, (TestCase) => TestCase.problem)
	testCases: TestCase[];

	constructor(problem: Partial<Problem>) {
		Object.assign(this, problem);
	}
}
