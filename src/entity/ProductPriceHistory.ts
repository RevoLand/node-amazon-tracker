import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ProductDetail } from './ProductDetail';

@Entity('product_price_histories')
export class ProductPriceHistory extends BaseEntity {
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

    @CreateDateColumn()
    created_at: Date;
}
