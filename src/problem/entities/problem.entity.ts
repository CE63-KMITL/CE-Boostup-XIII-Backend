import { User } from "./User";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

export type ScoreValue = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

@Entity()
export class Problem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;
    
    @ManyToOne(() => User, (user) => user.id)
    author: User;
    
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
    
    @Column({
        nullable: true
    })
    tags: string[];
    
    
}
