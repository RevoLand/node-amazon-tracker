import { Product } from '../entity/Product';
import { ProductDetail } from '../entity/ProductDetail';

export const createDemoProductData = async (): Promise<void> => {
  const demoProducts = [
    'B08MVBTSGL', // Ayakkabı
    '6052998385', // Kitap
    'B091Q7CG4N', // Stok dışı gıda
    'B08VYDYTL7', // 3. parti satıcı - amazon gönderici
    'B07CVBSCCH' // yurtdışı ürün
  ];

  for (const productAsin of demoProducts) {
    const product = new Product;
    product.asin = productAsin;
    product.tracking_countries = ['tr'];
    await product.save();

    product.productDetail = new ProductDetail;
    product.productDetail.asin = product.asin;
    product.productDetail.name = productAsin;
    product.productDetail.country = 'tr';
    product.productDetail.enabled = true;
    product.productDetail.price = 0;
    product.productDetail.lowest_price = 0;
    product.productDetail.current_price = 0;
    product.productDetail.save();
  }

  console.log('Demo Product Data created.');
}
