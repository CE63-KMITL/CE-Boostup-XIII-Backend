import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
   @PrimaryGeneratedColumn('uuid')
   id: string;

   @Column()
   username: string;

   @Column()
   @Exclude()
   password: string;
}
