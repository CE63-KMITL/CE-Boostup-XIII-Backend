import { IsEmail, IsNumber } from "class-validator";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Role } from "../shared/enum/role.enum";
import { ScoreLog } from "./score-log.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: false, default: Role.MEMBER, enum: Role, type: "enum" })
  role: Role;

  @Column({ nullable: false, default: 0 })
  @IsNumber()
  score: number;

  @CreateDateColumn({ type: "timestamp", nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", nullable: false })
  updatedAt: Date;

  @OneToMany(() => ScoreLog, (scoreLog) => scoreLog.user)
  scoreLogs: ScoreLog[];
}