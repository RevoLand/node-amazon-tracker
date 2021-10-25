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

    // TODO: Discord related actions?

    return productDetail;
  }

  static updateProductDetail = async (productDetail: ProductDetail, productDetailInterface: ProductDetailInterface) => {
    productDetail.asin = productDetailInterface.parsedData.asin;
    productDetail.name = productDetailInterface.parsedData.title;
    productDetail.country = productDetailInterface.parsedData.locale;
    productDetail.image = productDetailInterface.parsedData.image;
    productDetail.enabled = true;

    if (typeof productDetailInterface.psc !== 'undefined') {
      productDetail.psc = productDetailInterface.psc;
    }

    if (typeof productDetailInterface.seller_id !== 'undefined') {
      productDetail.seller_id = productDetailInterface.seller_id;
    }

    if (typeof productDetail.lowest_price === 'undefined' || (typeof productDetailInterface.parsedData.price !== 'undefined' && productDetailInterface.parsedData.price < productDetail.lowest_price)) {
      productDetail.lowest_price = productDetailInterface.parsedData.price;
    }

    productDetail.current_price = productDetailInterface.parsedData.price;
    await productDetail.save();

    // TODO: Discord related actions?

    return productDetail;
  };

  static disableProductTracking = async (productDetail: ProductDetail) => {
    productDetail.enabled = false;

    await productDetail.save();

    // TODO: Discord related actions?

    return productDetail;
  }

  static deleteProductTracking = async (productDetail: ProductDetail) => {
    try {
      await productDetail.remove();

      // TODO: Discord related actions?

      return true;
    } catch (error) {
      console.error('An error happened while deleting product tracking from database.', error);

      return false;
    }
  }
}
