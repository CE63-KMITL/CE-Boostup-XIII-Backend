import { Column, PrimaryGeneratedColumn } from "typeorm";

export class TestCase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    expectOutput: string;

    @Column()
    hiddenTestcase: boolean;
}
