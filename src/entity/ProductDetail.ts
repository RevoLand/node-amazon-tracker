import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './Product';

@Entity('product_details')
export class ProductDetail extends BaseEntity {
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

    @Column('tinyint', {
      width: 1,
      default: 1
    })
    enabled = true;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
