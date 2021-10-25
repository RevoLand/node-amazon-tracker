import { ProductDetail } from '../entity/ProductDetail';

export interface CreateProductFromUrlResultInterface {
  productDetail: ProductDetail,
  existing_product_detail: boolean
}
