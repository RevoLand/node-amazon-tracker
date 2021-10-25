import { getRepository } from 'typeorm';
import { URL } from 'url';
import productParser from '../components/product/productParser';
import { Product } from '../entity/Product';
import { CreateProductFromUrlResultInterface } from '../interfaces/CreateProductFromUrlResultInterface';
import { ProductDetailParseResultInterface } from '../interfaces/ProductDetailParseResultInterface';
import { ProductDetailController } from './ProductDetailController';
export class ProductController {

  static findByAsin(asin: string): Promise<Product | undefined> {
    return getRepository(Product).findOne({
      where: {
        asin
      },
      relations: ['productDetails']
    });
  }

  static getAll = () => getRepository(Product).find({
    relations: ['productDetails']
  });

  static createProduct = async (asin: string, locale: string): Promise<Product> => {
    const product = new Product(asin, locale);

    await product.save();

    return product;
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

    const existingProduct = await this.findByAsin(parsedProductData.asin);
    if (existingProduct) {
      if (!existingProduct.tracking_countries.includes(parsedProductData.locale)) {
        existingProduct.tracking_countries.push(parsedProductData.locale);
        existingProduct.save();
      }

      const existingProductDetail = existingProduct.productDetails?.find(productDetail => productDetail.country === parsedProductData.locale);
      const productDetailToCreate: ProductDetailParseResultInterface = {
        product: existingProduct,
        parsedData: parsedProductData,
        psc,
        seller_id
      };

      const result: CreateProductFromUrlResultInterface = {
        productDetail: !existingProductDetail ? await ProductDetailController.createProductDetail(productDetailToCreate) : await ProductDetailController.updateProductDetail(existingProductDetail, productDetailToCreate),
        existing_product_detail: !! existingProductDetail
      }

      return result;
    }

    const product = await this.createProduct(parsedProductData.asin, parsedProductData.locale);
    const productDetailToCreate: ProductDetailParseResultInterface = {
      product,
      parsedData: parsedProductData,
      psc,
      seller_id
    };

    const result: CreateProductFromUrlResultInterface = {
      productDetail: await ProductDetailController.createProductDetail(productDetailToCreate),
      existing_product_detail: false
    }

    return result;
  }
}
