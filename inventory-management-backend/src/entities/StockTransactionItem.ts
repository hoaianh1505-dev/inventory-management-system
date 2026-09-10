import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { StockTransaction } from "./StockTransaction";
import { Product } from "./Product";
import { WarehouseLocation } from "./WarehouseLocation";

@Entity("stock_transaction_items")
export class StockTransactionItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  transaction_id: string;

  @ManyToOne(() => StockTransaction, (tx) => tx.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "transaction_id" })
  transaction: StockTransaction;

  @Column({ type: "uuid" })
  product_id: string;

  @ManyToOne(() => Product, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "uuid", nullable: true })
  location_id: string;

  @ManyToOne(() => WarehouseLocation, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "location_id" })
  location: WarehouseLocation;

  @Column({ type: "uuid", nullable: true })
  target_location_id: string;

  @ManyToOne(() => WarehouseLocation, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "target_location_id" })
  target_location: WarehouseLocation;

  @Column({ type: "int", default: 0 })
  quantity: number;

  @Column({ type: "int", nullable: true })
  counted_quantity: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  unit_price: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  total_price: number;
}
