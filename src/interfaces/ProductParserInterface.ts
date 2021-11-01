export interface ProductParserInterface {
  title: string,
  asin: string,
  image?: string,
  locale: string,
  primeOnly?: boolean,
  abroad?: boolean,
  shippingFee?: string,

  price?: number,

  stock?: number,
  stockText?: string,
  seller?: string,
  available?: boolean
}
