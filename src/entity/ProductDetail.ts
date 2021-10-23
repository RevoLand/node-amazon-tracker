import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Product } from './Product';

@Entity('product_details')
export class ProductDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => Product, {
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION'
    })
    @JoinColumn({
      name: 'asin',
      referencedColumnName: 'asin'
    })
    asin: string;

    @Column()
    country: string;

    @Column()
    name?: string;

    @Column()
    image?: string;

    @Column('decimal', {
      precision: 14,
      scale: 2
    })
    price: number;

    @Column('decimal', {
      precision: 14,
      scale: 2
    })
    lowest_price: number;

    @Column('decimal', {
      precision: 14,
      scale: 2
    })
    current_price: number;

    @Column()
    seller?: string;

    @Column('tinyint', {
      width: 1
    })
    enabled = true;

    @Column('timestamp')
    created_at: string;

    @Column('timestamp')
    updated_at: string;
}
