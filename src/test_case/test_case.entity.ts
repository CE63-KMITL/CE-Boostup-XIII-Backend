import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TestCase {
    @PrimaryGeneratedColumn()
    id: number;

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