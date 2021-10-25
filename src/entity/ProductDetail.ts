import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { URLSearchParams } from 'url';
import { Product } from './Product';
import { ProductPriceHistory } from './ProductPriceHistory';

@Entity('product_details')
export class ProductDetail extends BaseEntity {
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
      precision: 14,
      scale: 2,
      nullable: true
    })
    lowest_price?: number;

    @Column('decimal', {
      precision: 14,
      scale: 2,
      nullable: true
    })
    current_price?: number;

    @Column({
      nullable: true
    })
    seller?: string;

    @Column({
      nullable: true
    })
    seller_id?: string;

    @Column({
      nullable: true
    })
    psc?: number;

    @Column('tinyint', {
      width: 1,
      default: 1
    })
    enabled = true;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Product, product => product.productDetails, {
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION'
    })
    @JoinColumn({
      name: 'asin',
      referencedColumnName: 'asin'
    })
    product: Product;

    @OneToMany(() => ProductPriceHistory, priceHistory => priceHistory.productDetail, {
      onDelete: 'CASCADE',
      onUpdate: 'NO ACTION'
    })
    priceHistories: ProductPriceHistory[];

    getUrl = () => {
      // Amazon tr seller id: A1UNQM1SR2CHM
      const queryParameters = new URLSearchParams();
      let productUrl = `https://www.amazon.com.tr/gp/product/${this.asin}/`;

      if (this.seller_id) {
        queryParameters.append('smid', this.seller_id);
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
