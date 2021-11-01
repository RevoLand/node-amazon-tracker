import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Product } from './Product';

@Entity('product_price_histories')
export class ProductPriceHistory extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    product_detail_id: number;

    @Column('decimal', {
      precision: 14,
      scale: 2
    })
    old_price: number;

    @Column('decimal', {
      precision: 14,
      scale: 2
    })
    new_price: number;

    @Column('boolean', {
      default: 0,
    })
    prime_only: boolean;

    @CreateDateColumn()
    created_at: Date;

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
