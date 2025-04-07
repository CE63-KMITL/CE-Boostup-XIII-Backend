import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity("houseScore")
export class HouseScore {
  @PrimaryGeneratedColumn()
  id: number; // Primary Key

  @Column()
  name: String;

  @Column('int')
  value: number; 

  @Column('int')
  total: number; 

  @CreateDateColumn()
  createdAt: Date; 

  @UpdateDateColumn()
  updatedAt: Date; 
}
