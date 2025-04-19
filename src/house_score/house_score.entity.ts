import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity("houseScore")
export class HouseScore {
  @PrimaryGeneratedColumn()
  id: number; 

  @Column()
  name: String;

  @Column('int')
  value: number; 

  @CreateDateColumn()
  createdAt: Date; 

  @UpdateDateColumn()
  updatedAt: Date; 
}
