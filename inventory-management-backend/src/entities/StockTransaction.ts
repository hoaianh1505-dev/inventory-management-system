import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { TransactionType } from "../constants";
import { Warehouse } from "./Warehouse";
import { Supplier } from "./Supplier";
import { User } from "./User";
import { StockTransactionItem } from "./StockTransactionItem";

@Entity("stock_transactions")
export class StockTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: "varchar", length: 100, unique: true, nullable: true })
  reference_no: string;

  @Column({ type: "uuid" })
  warehouse_id: string;

  @ManyToOne(() => Warehouse, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse;

  @Column({ type: "uuid", nullable: true })
  target_warehouse_id: string;

  @ManyToOne(() => Warehouse, { onDelete: "RESTRICT", nullable: true })
  @JoinColumn({ name: "target_warehouse_id" })
  target_warehouse: Warehouse;

  @Column({ type: "uuid", nullable: true })
  supplier_id: string;

  @ManyToOne(() => Supplier, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier;

  @Column({ type: "uuid" })
  created_by_user_id: string;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "created_by_user_id" })
  created_by: User;

  @Column({ type: "text", nullable: true })
  note: string;

  @OneToMany(() => StockTransactionItem, (item) => item.transaction, {
    cascade: true,
  })
  items: StockTransactionItem[];

  @CreateDateColumn()
  created_at: Date;
}
