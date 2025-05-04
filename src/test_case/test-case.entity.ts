import { Problem } from 'src/problem/problem.entity';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class TestCase {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true, type: 'varchar' })
	input: string;

	@Column({ nullable: false, type: 'varchar' })
	expectOutput: string;

	@Column({ nullable: false, type: 'bool' })
	isHiddenTestcase: boolean;

	@ManyToOne(() => Problem, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'problem' })
	problem: Problem;
}
