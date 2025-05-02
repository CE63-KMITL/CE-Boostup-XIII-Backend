import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TestCase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    expectOutput: string;

    @Column()
    hiddenTestcase: boolean;

    constructor(item: Partial<TestCase>) {
        Object.assign(this, TestCase);
    }
}
