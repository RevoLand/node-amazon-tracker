import { ProductDetail } from '../entity/ProductDetail';
import { ProductDetailParseResultInterface } from '../interfaces/ProductDetailParseResultInterface';

export class ProductDetailController {
  static createProductDetail = async (productDetailInterface: ProductDetailParseResultInterface): Promise<ProductDetail> => {
    const productDetail = new ProductDetail;

    productDetail.asin = productDetailInterface.parsedData.asin;
    productDetail.name = productDetailInterface.parsedData.title;
    productDetail.country = productDetailInterface.parsedData.locale;
    productDetail.image = productDetailInterface.parsedData.image;
    productDetail.enabled = true;
    productDetail.psc = productDetailInterface.psc;
    productDetail.seller = productDetailInterface.parsedData.seller;
    productDetail.seller_id = productDetailInterface.seller_id;
    productDetail.price = productDetailInterface.parsedData.price;
    productDetail.lowest_price = productDetailInterface.parsedData.price;
    productDetail.current_price = productDetailInterface.parsedData.price;
    productDetail.product = productDetailInterface.product;

    await productDetail.save();

    // TODO: Discord related actions?

    return productDetail;
  }

  static updateProductDetail = async (productDetail: ProductDetail, productDetailInterface: ProductDetailParseResultInterface) => {
    productDetail.asin = productDetailInterface.parsedData.asin;
    productDetail.name = productDetailInterface.parsedData.title;
    productDetail.country = productDetailInterface.parsedData.locale;
    productDetail.image = productDetailInterface.parsedData.image;
    productDetail.seller = productDetailInterface.parsedData.seller;
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
