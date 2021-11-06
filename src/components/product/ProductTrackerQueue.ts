import { Product } from '../../entity/Product';

export class ProductTrackerQueue {
  products: Product[] = [];

  enqueue(product: Product): void {
    this.products.push(product);
  }

  dequeue(): Product | undefined {
    return this.products.shift();
  }

  isEmpty() {
    return this.products.length === 0;
  }

  length() {
    return this.products.length;
  }

  clear() {
    this.products =  [];
  }

  hasProduct(product: Product) {
    return this.products.filter(_product => _product.id === product.id).length > 0;
  }

  removeProductFromQueue(product: Product) {
    this.products = this.products.filter(_product => _product.id !== product.id);
  }

  peek(): Product | undefined {
    return !this.isEmpty() ? this.products[0] : undefined;
  }
}
