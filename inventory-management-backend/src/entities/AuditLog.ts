import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", nullable: true })
  user_id: string;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 100 })
  action: string;

  @Column({ type: "varchar", length: 100 })
  entity_type: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  entity_id: string;

  @Column({ type: "jsonb", nullable: true })
  old_values: any;

  @Column({ type: "jsonb", nullable: true })
  new_values: any;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;
}
