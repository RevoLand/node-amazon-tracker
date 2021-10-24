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
    const productDetails = new ProductDetail;
    product.asin = productAsin;
    product.tracking_countries = ['tr'];
    await product.save();

    productDetails.asin = productAsin;
    productDetails.name = productAsin;
    productDetails.country = 'tr';
    productDetails.enabled = true;
    productDetails.price = 0;
    productDetails.lowest_price = 0;
    productDetails.current_price = 0;
    productDetails.product = product;
    await productDetails.save();
  }

  console.log('Demo Product Data created.');
}
