import { UUID } from "crypto";
import { User } from "Data";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type ScoreValue = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

@Entity()
export class Problem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;
    
    @Column()
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
    
    @Column({
        nullable: true
    })
    tags: number;
    
    
}
