import { getRepository, LessThanOrEqual } from 'typeorm';
import { URL } from 'url';
import productParser from '../components/product/productParser';
import { ProductTracker } from '../components/product/ProductTracker';
import { Product } from '../entity/Product';
import { CreateProductFromUrlResultInterface } from '../interfaces/CreateProductFromUrlResultInterface';
import { ProductParseResultInterface } from '../interfaces/ProductParseResultInterface';

export class ProductController {

  static all(): Promise<Product[] | undefined> {
    return getRepository(Product).find();
  }

  static enabled(): Promise<Product[] | undefined> {
    return getRepository(Product).find({
      where: {
        enabled: true
      }
    });
  }

  static enabledWithCountryAndDateFilter(country: string, lastUpdate: Date): Promise<Product[] | undefined> {
    return getRepository(Product).find({
      where: {
        enabled: true,
        country,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        updatedAt: LessThanOrEqual(lastUpdate)
      }
    });
  }

  static byAsin(asin: string): Promise<Product[] | undefined> {
    return getRepository(Product).find({
      where: {
        asin
      },
    })
  }

  static byAsinAndLocale(asin: string, locale: string): Promise<Product | undefined> {
    return getRepository(Product).findOne({
      where: {
        asin: asin,
        country: locale
      },
    })
  }

  static createProductFromUrl = async (url: string, productTracker: ProductTracker) : Promise<CreateProductFromUrlResultInterface | undefined> => {
    const urlParameters = (new URL(url)).searchParams;
    const parsedProductData = await productParser(url, productTracker);
    const sellerId = urlParameters.has('smid') ? urlParameters.get('smid') ?? '' : undefined;
    const psc = urlParameters.has('psc') ? Number(urlParameters.get('psc')) : undefined;

    if (!parsedProductData) {
      console.log('Couldn\'t create product from url as the url couldn\'t be parsed.');
      return;
    }

    const productResult: ProductParseResultInterface = {
      product: await this.byAsinAndLocale(parsedProductData.asin, parsedProductData.locale),
      parsedData: parsedProductData,
      psc,
      sellerId: sellerId
    };

    const result: CreateProductFromUrlResultInterface = {
      productDetail: await this.upsertProduct(productResult),
      existingProduct: !! productResult.product
    }

    return result;
  }

  static upsertProduct = async (productParseResult: ProductParseResultInterface) : Promise<Product> => {
    const product = productParseResult.product ?? new Product;

    product.asin = productParseResult.parsedData.asin;
    product.name = productParseResult.parsedData.title;
    product.country = productParseResult.parsedData.locale;
    product.image = productParseResult.parsedData.image;

    if (typeof productParseResult.psc !== 'undefined') {
      product.psc = productParseResult.psc;
    }

    if (typeof productParseResult.sellerId !== 'undefined') {
      product.sellerId = productParseResult.sellerId;
    }

    if (typeof product.lowestPrice === 'undefined' || (typeof productParseResult.parsedData.price !== 'undefined' && productParseResult.parsedData.price < product.lowestPrice)) {
      product.lowestPrice = productParseResult.parsedData.price;
    }

    if (typeof product.price === 'undefined') {
      product.price = productParseResult.parsedData.price;
    }

    product.seller = productParseResult.parsedData.seller;
    product.currentPrice = productParseResult.parsedData.price;

    await product.save();

    return product;
  }

  static disableProductTracking = async (productDetail: Product) => {
    productDetail.enabled = false;

    await productDetail.save();

    // TODO: Discord related actions?

    return productDetail;
  }
}
