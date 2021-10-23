const { parseProductUrls } = require('./productUrlHelper');

describe('parse product urls from text', () => {
  const textWithSingleUrl = 'Merhaba dünya! https://www.amazon.com.tr/gp/product/6058821002/ref=ox_sc_act_image_1?smid=A1UNQM1SR2CHM&psc=1';
  const textWithMultipleUrls = 'Size bugün önereceğim amazon ürünleri şu: https://www.amazon.com.tr/gp/product/6058821002/ref=ox_sc_act_image_1?smid=A1UNQM1SR2CHM&psc=1 ve aynı zamanda https://www.amazon.com.tr/gp/product/B08MVBTSGL/ref=ox_sc_saved_image_7?smid=A1UNQM1SR2CHM&psc=1, birde şuna göz atabilirsiniz: https://www.amazon.com.tr/gp/product/B08J45VJ8Y/ref=ox_sc_saved_image_6?smid=A1UNQM1SR2CHM&psc=1';
  const linkWithoutHttpOrWwwPart = 'bu url de çalışmalı mı acaba?🤔 amazon.com.tr/gp/product/6058821002';
  const textWithBrokenLink = 'bozuk url🤔 /gp/product/6058821002';

  // Test 1 - the function should be able to parse a single url from text
  test('should parse url from single url', () => {
    expect(parseProductUrls(textWithSingleUrl)).toHaveLength(1);
    expect(parseProductUrls(textWithSingleUrl)).toContain('https://www.amazon.com.tr/gp/product/6058821002/ref=ox_sc_act_image_1?smid=A1UNQM1SR2CHM&psc=1');
  })

  // Test 2 - the function should be able to parse multiple urls from text
  test('should parse multiple urls from text', () => {
    expect(parseProductUrls(textWithMultipleUrls)).toHaveLength(3);
  })

  // Test 3 - the function should be able to parse url from text without www or http part
  test('should parse url from text without http and www part', () => {
    expect(parseProductUrls(linkWithoutHttpOrWwwPart)).toHaveLength(1);
    expect(parseProductUrls(linkWithoutHttpOrWwwPart)).toContain('https://amazon.com.tr/gp/product/6058821002');
  })

  // Test 4 - the function should not be able to parse broken url from text
  test('should not parse url with corrupt format', () => {
    expect(parseProductUrls(textWithBrokenLink)).toHaveLength(0);
  })

});
