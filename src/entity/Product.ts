import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
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

    @OneToMany(() => ProductDetail, productDetail => productDetail.product, {
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION'
    })
    productDetails: ProductDetail[]

    constructor(asin?: string, locale?: string) {
      super();

      if (typeof asin !== 'undefined') {
        this.asin = asin;
      }

      if (typeof locale !== 'undefined') {
        this.tracking_countries = [locale];
      }

    }
}
