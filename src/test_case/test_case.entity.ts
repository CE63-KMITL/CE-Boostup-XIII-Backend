import { Problem } from "src/problem/problem.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TestCase {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Problem, (problem) => problem.testCases, { onDelete: 'CASCADE' })
    problem: Problem

    @Column()
    input: string;

    @Column()
    expectOutput: string;

    @Column()
    hiddenTestcase: boolean;

    constructor(item: Partial<TestCase>) {
        Object.assign(this, TestCase);
    }
}

@Entity()
export class TestCaseResult {
    @Column()
    status: "Pass" | "Not Pass" | "Error";

    @Column()
    message: string;

    @Column()
    exitCode: number;
}