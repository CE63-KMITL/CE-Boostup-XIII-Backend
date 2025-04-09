import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity('ชื่อtable')
export class Auth {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column({ unique: true,nullable:false })
    email: string;
  
    @Column({nullable: false})
    password: string;

    
}
