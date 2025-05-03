import { IsEnum } from 'class-validator';
import { User } from 'src/user/user.entity';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ProblemStaffStatusEnum } from './enum/problem-staff-status.enum';
import { ScoreValue } from './type/score-value.type';

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
		nullable: true,
	})
	defaultCode?: string;

	@Column({
		nullable: true
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

	constructor(problem: Partial<Problem>) {
		Object.assign(this, problem);
	}
}
