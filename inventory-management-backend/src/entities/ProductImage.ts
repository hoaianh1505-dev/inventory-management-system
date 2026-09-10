import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./Product";

@Entity("product_images")
export class ProductImage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  product_id: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "varchar", length: 500 })
  image_url: string;

  @Column({ type: "varchar", length: 255 })
  s3_key: string;

  @Column({ type: "boolean", default: false })
  is_primary: boolean;

  @CreateDateColumn()
  created_at: Date;
}
