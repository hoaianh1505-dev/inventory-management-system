import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { WarehouseLocation } from "./WarehouseLocation";

@Entity("warehouses")
export class Warehouse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "varchar", length: 50, unique: true })
  code: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "uuid", nullable: true })
  manager_id: string;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "manager_id" })
  manager: User;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @OneToMany(() => WarehouseLocation, (location) => location.warehouse)
  locations: WarehouseLocation[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
