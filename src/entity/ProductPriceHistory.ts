import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { ProductDetail } from './ProductDetail';

@Entity('product_price_histories')
export class ProductPriceHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => ProductDetail, {
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION'
    })
    @JoinColumn({
      name: 'product_detail_id',
      referencedColumnName: 'id'
    })
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

    @Column('timestamp')
    created_at: string;
}
