import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Category } from "./Category";
import { Unit } from "./Unit";
import { Supplier } from "./Supplier";
import { ProductImage } from "./ProductImage";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 200 })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  sku: string;

  @Column({ type: "varchar", length: 100, unique: true, nullable: true })
  barcode: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  cost_price: number;

  @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
  selling_price: number;

  @Column({ type: "int", default: 10 })
  low_stock_threshold: number;

  @Column({ type: "uuid", nullable: true })
  category_id: string;

  @ManyToOne(() => Category, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "category_id" })
  category: Category;

  @Column({ type: "uuid", nullable: true })
  unit_id: string;

  @ManyToOne(() => Unit, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "unit_id" })
  unit: Unit;

  @Column({ type: "uuid", nullable: true })
  supplier_id: string;

  @ManyToOne(() => Supplier, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "supplier_id" })
  supplier: Supplier;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
