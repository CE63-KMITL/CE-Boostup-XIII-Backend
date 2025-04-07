import { User } from "src/user/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { UUID } from "typeorm/driver/mongodb/bson.typings";

export type ScoreValue = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

@Entity()
export class Problem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => User, (user) => user.id)
    author: UUID;

    @Column({
        nullable: true
    })
    description: string;


    @Column({
        nullable: true
    })
    default_code: string;

    @Column({
        type: "enum",
        enum: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
        default: 2
    })
    difficulty: ScoreValue

    @Column('simple-array', { nullable: true, array: true })

    tags: string[];

    constructor(problem: Partial<Problem>) {
        Object.assign(this, problem)
    }
}
