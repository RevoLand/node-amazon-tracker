import { Product } from '../entity/Product';
import { ProductParserInterface } from './ProductParserInterface';

export interface ProductParseResultInterface {
  product?: Product,
  parsedData: ProductParserInterface,
  sellerId?: string | undefined,
  psc?: number | undefined
}
