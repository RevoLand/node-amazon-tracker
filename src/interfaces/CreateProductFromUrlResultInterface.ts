import { Product } from '../entity/Product';

export interface CreateProductFromUrlResultInterface {
  productDetail: Product,
  existingProduct: boolean
}
