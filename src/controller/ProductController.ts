import { exit } from 'process';
import { getRepository } from 'typeorm';
import { URL } from 'url';
import productParser from '../components/product/productParser';
import { Product } from '../entity/Product';
import { ProductDetailController, ProductDetailInterface } from './ProductDetailController';

export class ProductController {
  static getAll = () => getRepository(Product).find({
    relations: ['productDetails']
  });

  static findByAsin(asin: string): Promise<Product | undefined> {
    return getRepository(Product).findOne({
      where: {
        asin
      },
      relations: ['productDetails']
    });
  }

  static createProduct = async (asin: string, locale: string): Promise<Product> => {
    const product = new Product;

    product.asin = asin;
    product.tracking_countries = [locale];

    await product.save();

    return product;
  }

  static createProductFromUrl = async (url: string) => {
    // https://www.amazon.com.tr/gp/product/6058821002/ref=ox_sc_act_image_1?smid=A1UNQM1SR2CHM&psc=1
    const urlParameters = (new URL(url)).searchParams;
    const parsedProductData = await productParser(url);
    const seller_id = urlParameters.has('smid') ? urlParameters.get('smid') ?? '' : undefined;
    const psc = urlParameters.has('psc') ? Number(urlParameters.get('psc')) : undefined;

    console.log('createProductFromUrl', {
      parsedProductData
    });

    if (!parsedProductData) {
      console.log('Couldn\'t create product from url as the url couldn\'t be parsed.');
      return;
    }

    const existingProduct = await this.findByAsin(parsedProductData.asin);
    if (existingProduct) {
      console.log('Product already exists. Updating the current product.', existingProduct);
      if (!existingProduct.tracking_countries.includes(parsedProductData.locale)) {
        existingProduct.tracking_countries.push(parsedProductData.locale);
        existingProduct.save();
      }

      const existingProductDetails = existingProduct.productDetails?.find(productDetail => productDetail.country === parsedProductData.locale);
      const productDetail: ProductDetailInterface = {
        product: existingProduct,
        parsedData: parsedProductData,
        psc,
        seller_id
      };

      if (!existingProductDetails) {
        console.log('Creating product details for locale: ' + productDetail.parsedData.locale);
        await ProductDetailController.createProductDetail(productDetail);
      } else {
        console.log('Updating existing product details for locale: ' + productDetail.parsedData.locale);
        await ProductDetailController.updateProductDetail(existingProductDetails, productDetail);
      }

      return;
    }

    const product = await this.createProduct(parsedProductData.asin, parsedProductData.locale);
    const productDetail: ProductDetailInterface = {
      product,
      parsedData: parsedProductData,
      psc,
      seller_id
    };
    await ProductDetailController.createProductDetail(productDetail);

    console.log('product created!');
    exit();
  }
}
