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
  user_id: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User | null;

  @Column({ type: "varchar", length: 100 })
  action: string;

  @Column({ type: "varchar", length: 100 })
  entity_name: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  entity_id: string | null;

  @Column({ type: "json", nullable: true })
  details: any;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip_address: string | null;

  @CreateDateColumn()
  created_at: Date;
}
