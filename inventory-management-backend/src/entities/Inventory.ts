import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Warehouse } from "./Warehouse";
import { WarehouseLocation } from "./WarehouseLocation";
import { Product } from "./Product";

@Entity("inventory")
@Unique(["warehouse_id", "location_id", "product_id"])
export class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  warehouse_id: string;

  @ManyToOne(() => Warehouse, { onDelete: "CASCADE" })
  @JoinColumn({ name: "warehouse_id" })
  warehouse: Warehouse;

  @Column({ type: "uuid", nullable: true })
  location_id: string | null;

  @ManyToOne(() => WarehouseLocation, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "location_id" })
  location: WarehouseLocation;

  @Column({ type: "uuid" })
  product_id: string;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "int", default: 0 })
  quantity: number;

  @UpdateDateColumn()
  updated_at: Date;
}
