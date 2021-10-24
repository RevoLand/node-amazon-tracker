import { ProductParser } from '../components/product/productParser';
import { Product } from '../entity/Product';
import { ProductDetail } from '../entity/ProductDetail';

export interface ProductDetailInterface {
  product: Product,
  parsedData: ProductParser,
  seller_id?: string | undefined,
  psc?: number | undefined
}

export class ProductDetailController {
  static createProductDetail = async (createProductDetailInterface: ProductDetailInterface): Promise<ProductDetail> => {
    const productDetail = new ProductDetail;

    productDetail.asin = createProductDetailInterface.parsedData.asin;
    productDetail.name = createProductDetailInterface.parsedData.title;
    productDetail.country = createProductDetailInterface.parsedData.locale;
    productDetail.image = createProductDetailInterface.parsedData.image;
    productDetail.enabled = true;
    productDetail.psc = createProductDetailInterface.psc;
    productDetail.seller_id = createProductDetailInterface.seller_id;
    productDetail.price = createProductDetailInterface.parsedData.price;
    productDetail.lowest_price = createProductDetailInterface.parsedData.price;
    productDetail.current_price = createProductDetailInterface.parsedData.price;
    productDetail.product = createProductDetailInterface.product;

    await productDetail.save();

    return productDetail;
  }
}
