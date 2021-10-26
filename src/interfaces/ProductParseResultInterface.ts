import { ProductParser } from '../components/product/productParser';
import { Product } from '../entity/Product';

export interface ProductParseResultInterface {
  product?: Product,
  parsedData: ProductParser,
  seller_id?: string | undefined,
  psc?: number | undefined
}
