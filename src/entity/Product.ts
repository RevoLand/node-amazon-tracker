import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { ProductDetail } from './ProductDetail';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
      unique: true
    })
    asin: string;

    @Column('json')
    tracking_countries: string[];

    @OneToOne(() => ProductDetail, productDetail => productDetail.asin, {
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION'
    })
    productDetail: ProductDetail
}
