import { IsEmail } from "class-validator";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "../shared/enum/role.enum";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: false, default: Role.MEMBER, enum: Role, type: "enum" })
  role: Role;

  @CreateDateColumn({ type: "timestamp", nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", nullable: false })
  updatedAt: Date;
}
