import { getRepository } from 'typeorm';
import { Product } from '../entity/Product';

export class ProductController {
  static getAll = () => getRepository(Product).find({
    relations: ['productDetails']
  });
}
