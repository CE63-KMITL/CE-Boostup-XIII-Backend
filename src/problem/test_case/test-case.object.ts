import { Column } from 'typeorm';

export class TestCase {
	@Column({ nullable: true, type: 'varchar' })
	input: string;

	@Column({ nullable: false, type: 'varchar' })
	expectOutput: string;

	@Column({ nullable: false, type: 'bool' })
	isHiddenTestcase: boolean;
}
