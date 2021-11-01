import { Product } from '../entity/Product';
import { ProductPriceHistory } from '../entity/ProductPriceHistory';

export interface PriceChangeInterface {
  product: Product,
  priceHistory: ProductPriceHistory,
  priceDiff: number,
  lowestPriceDiff: number,
  priceDiffPerc: number,
  lowestPriceDiffPerc: number
}
