import { Product } from '../entity/Product';
import { ProductParserInterface } from './ProductParserInterface';

export interface ProductParseResultInterface {
  product?: Product,
  parsedData: ProductParserInterface,
  seller_id?: string | undefined,
  psc?: number | undefined
}
