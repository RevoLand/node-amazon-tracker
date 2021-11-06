import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Product } from './Product';

@Entity('product_price_histories')
export class ProductPriceHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
      name: 'product_detail_id'
    })
    productId: number;

    @Column('decimal', {
      name: 'old_price',
      precision: 14,
      scale: 2,
    })
    oldPrice: number;

    @Column('decimal', {
      name: 'new_price',
      precision: 14,
      scale: 2,
    })
    newPrice: number;

    @Column('boolean', {
      name: 'prime_only',
      default: 0,
    })
    primeOnly: boolean;

    @CreateDateColumn({
      name: 'created_at'
    })
    createdAt: Date;

    @ManyToOne(() => Product, product => product.priceHistories, {
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION',
    })
    @JoinColumn({
      name: 'product_detail_id',
      referencedColumnName: 'id'
    })
    product: Product;
}
