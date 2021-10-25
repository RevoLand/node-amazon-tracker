import { ProductController } from '../controller/ProductController';

export const createDemoProductData = async (): Promise<void> => {
  const demoProducts = [
    'https://www.amazon.com.tr/gp/product/B08MVBTSGL/ref=ox_sc_saved_image_7?smid=A1UNQM1SR2CHM&psc=1', // Ayakkabı
    'https://www.amazon.com.tr/gp/product/6052998385/ref=ox_sc_saved_image_4?smid=A1UNQM1SR2CHM&psc=1', // Kitap
    'https://www.amazon.com.tr/gp/product/B091Q7CG4N/ref=ox_sc_saved_image_3?smid=&psc=1', // Stok dışı gıda
    'https://www.amazon.com.tr/gp/product/B08VYDYTL7/ref=ox_sc_saved_image_5?smid=A1HN1W25VYST46&psc=1', // 3. parti satıcı - amazon gönderici
    'https://www.amazon.com.tr/gp/product/B07CVBSCCH/ref=ox_sc_saved_image_7?smid=A3O5TP4R0OZYXZ&psc=1' // yurtdışı ürün
  ];

  for (const productUrl of demoProducts) {
    await ProductController.createProductFromUrl(productUrl);
  }

  console.log('Demo Product Data has been created.');
}
