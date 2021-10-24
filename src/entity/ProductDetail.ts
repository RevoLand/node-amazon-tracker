import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { URLSearchParams } from 'url';
import { Product } from './Product';

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

    @Column({
      nullable: true
    })
    seller?: string;

    @Column({
      nullable: true
    })
    seller_id: string;

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

    getUrl = () => {
      // Amazon tr seller id: A1UNQM1SR2CHM
      const queryParameters = new URLSearchParams();
      let productUrl = `https://www.amazon.com.tr/gp/product/${this.asin}/`;

      if (this.seller_id) {
        queryParameters.append('smid', this.seller_id);
      }

      if (queryParameters.toString().length > 0) {
        productUrl += '?';
        productUrl += queryParameters.toString();
      }

      return productUrl;
    }
}
