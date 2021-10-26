import { getRepository } from 'typeorm';
import { URL } from 'url';
import productParser from '../components/product/productParser';
import { Product } from '../entity/Product';
import { CreateProductFromUrlResultInterface } from '../interfaces/CreateProductFromUrlResultInterface';
import { ProductParseResultInterface } from '../interfaces/ProductParseResultInterface';

export class ProductController {

  static findByAsin(asin: string): Promise<Product[] | undefined> {
    return getRepository(Product).find({
      where: {
        asin
      },
    })
  }

  static findByAsinAndLocale(asin: string, locale: string): Promise<Product | undefined> {
    return getRepository(Product).findOne({
      where: {
        asin: asin,
        country: locale
      },
    })
  }

  static createProductFromUrl = async (url: string) : Promise<CreateProductFromUrlResultInterface | undefined> => {
    const urlParameters = (new URL(url)).searchParams;
    const parsedProductData = await productParser(url);
    const seller_id = urlParameters.has('smid') ? urlParameters.get('smid') ?? '' : undefined;
    const psc = urlParameters.has('psc') ? Number(urlParameters.get('psc')) : undefined;

    if (!parsedProductData) {
      console.log('Couldn\'t create product from url as the url couldn\'t be parsed.');
      return;
    }

    const productResult: ProductParseResultInterface = {
      product: await this.findByAsinAndLocale(parsedProductData.asin, parsedProductData.locale),
      parsedData: parsedProductData,
      psc,
      seller_id
    };

    const result: CreateProductFromUrlResultInterface = {
      productDetail: await this.upsertProductDetail(productResult),
      existing_product_detail: !! productResult.product
    }

    return result;
  }

  static createProductDetail = async (productDetailInterface: ProductParseResultInterface): Promise<Product> => {
    const productDetail = new Product;

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

    await productDetail.save();

    // TODO: Discord related actions?

    return productDetail;
  }

  static upsertProductDetail = async (productParseResult: ProductParseResultInterface) : Promise<Product> => {
    const product = productParseResult.product ?? new Product;

    product.asin = productParseResult.parsedData.asin;
    product.name = productParseResult.parsedData.title;
    product.country = productParseResult.parsedData.locale;
    product.image = productParseResult.parsedData.image;
    product.enabled = true;

    if (typeof productParseResult.psc !== 'undefined') {
      product.psc = productParseResult.psc;
    }

    if (typeof productParseResult.seller_id !== 'undefined') {
      product.seller_id = productParseResult.seller_id;
    }

    if (typeof product.lowest_price === 'undefined' || (typeof productParseResult.parsedData.price !== 'undefined' && productParseResult.parsedData.price < product.lowest_price)) {
      product.lowest_price = productParseResult.parsedData.price;
    }

    if (typeof product.price === 'undefined') {
      product.price = productParseResult.parsedData.price;
    }

    product.seller = productParseResult.parsedData.seller;
    product.current_price = productParseResult.parsedData.price;

    await product.save();

    return product;
  }

  static updateProductDetail = async (productDetail: Product, productDetailInterface: ProductParseResultInterface) => {
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

  static disableProductTracking = async (productDetail: Product) => {
    productDetail.enabled = false;

    await productDetail.save();

    // TODO: Discord related actions?

    return productDetail;
  }

  static deleteProductTracking = async (productDetail: Product) => {
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
