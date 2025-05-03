import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TestCase {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: false, type: 'char' })
	expectOutput: string;

	@Column({ nullable: false, type: 'bool' })
	hiddenTestcase: boolean;
}

@Entity()
export class TestCaseResult {
	@Column()
	status: 'Pass' | 'Not Pass' | 'Error';

	@Column()
	message: string;

	@Column()
	exitCode: number;
}
