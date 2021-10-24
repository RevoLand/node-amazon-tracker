import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductDetail } from './ProductDetail';

@Entity('products')
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
      unique: true
    })
    asin: string;

    @Column('json')
    tracking_countries: string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToOne(() => ProductDetail, productDetail => productDetail.asin, {
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION'
    })
    productDetail: ProductDetail

    static findByAsin(asin: string): Promise<Product | undefined> {
      return this.createQueryBuilder('products').where('products.asin = :asin', { asin }).getOne();
    }
}
