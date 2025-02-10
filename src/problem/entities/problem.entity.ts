import { User } from "Data";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Problem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;
    
    @Column()
    author: User;
    
    @Column()
    description: string;
    
    @Column()
    default_code: string;
    
    @Column()
    difficulty: number;
    
    @Column()
    tags: Tag[];
    
}
