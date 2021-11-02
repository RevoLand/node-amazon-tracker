import { Product } from '../entity/Product';
import { ProductPriceHistory } from '../entity/ProductPriceHistory';
import { ProductParserInterface } from './ProductParserInterface';

export interface PriceChangeInterface {
  product: Product,
  parsedProductData: ProductParserInterface,
  priceHistory: ProductPriceHistory,
  priceDiff: number,
  lowestPriceDiff: number,
  priceDiffPerc: number,
  lowestPriceDiffPerc: number
}
