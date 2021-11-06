import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Unique } from 'typeorm';
import { URLSearchParams } from 'url';
import { ProductPriceHistory } from './ProductPriceHistory';

@Entity('products')
@Unique('products_unique_constraint', ['asin', 'country'])
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    asin: string;

    @Column()
    country: string;

    @Column({
      nullable: true
    })
    name?: string;

    @Column({
      nullable: true
    })
    image?: string;

    @Column('decimal', {
      precision: 14,
      scale: 2,
      nullable: true
    })
    price?: number;

    @Column('decimal', {
      name: 'lowest_price',
      precision: 14,
      scale: 2,
      nullable: true
    })
    lowestPrice?: number;

    @Column('decimal', {
      name: 'current_price',
      precision: 14,
      scale: 2,
      nullable: true
    })
    currentPrice?: number;

    @Column({
      nullable: true
    })
    seller?: string;

    @Column({
      name: 'seller_id',
      nullable: true
    })
    sellerId?: string;

    @Column({
      nullable: true
    })
    psc?: number;

    @Column('tinyint', {
      width: 1,
      default: 1
    })
    enabled = true;

    @CreateDateColumn({
      name: 'created_at'
    })
    createdAt: Date;

    @UpdateDateColumn({
      name: 'updated_at'
    })
    updatedAt: Date;

    @OneToMany(() => ProductPriceHistory, priceHistory => priceHistory.product, {
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION'
    })
    priceHistories: ProductPriceHistory[];

    getUrl = () => {
      // Amazon tr seller id: A1UNQM1SR2CHM
      const queryParameters = new URLSearchParams();
      let productUrl = `https://www.amazon${this.country}/gp/product/${this.asin}/`;

      if (this.sellerId) {
        queryParameters.append('smid', this.sellerId);
      }

      if (this.psc) {
        queryParameters.append('psc', this.psc.toString());
      }

      if (queryParameters.toString().length > 0) {
        productUrl += '?';
        productUrl += queryParameters.toString();
      }

      return productUrl;
    }
}
