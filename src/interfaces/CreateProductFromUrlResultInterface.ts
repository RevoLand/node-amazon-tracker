import { Product } from '../entity/Product';

export interface CreateProductFromUrlResultInterface {
  productDetail: Product,
  existing_product_detail: boolean
}
