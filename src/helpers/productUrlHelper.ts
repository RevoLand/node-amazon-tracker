import getUrls from 'get-urls';
import { URL } from 'url';
import countries from '../config/countries';

export const getTldFromUrl = (urlToParse: string) => new URL(urlToParse).hostname.replace('www.', '').replace('amazon', '');

export const parseProductUrls = (text: string) => {
  let urls = Array.from<string>(getUrls(text, {
    forceHttps: true,
    removeSingleSlash: true,
    removeTrailingSlash: true,
    sortQueryParameters: false,
    stripWWW: false,
  }));

  urls = urls.filter(url => {
    const _url = new URL(url);
    if (!_url.hostname.includes('amazon.')) {
      return false;
    }

    const tld = getTldFromUrl(url);

    if (!countries.allowedCountries.includes(tld)) {
      return false;
    }

    return true;
  });

  return urls;
};

export const parseAsinFromUrl = (urlToParse: string): string => {
  const url = new URL(urlToParse);
  const splittedPathname = url.pathname.split('/');

  if (url.pathname.startsWith('/gp/product/')) {
    return splittedPathname[3];
  }

  if (url.pathname.includes('/dp/')) {
    if (splittedPathname.length > 5) {
      return splittedPathname[5];
    }

    if (splittedPathname[2].includes('dp')) {
      return splittedPathname[3];
    }

    return splittedPathname[2];
  }

  console.error('ASIN parse edilemedi?', { splittedPathname });

  return '';
}

export const parseProductUrlsWithTlds = (message: string) => {
  return parseProductUrls(message).map(productUrl => {
    return {
      asin: parseAsinFromUrl(productUrl),
      locale: getTldFromUrl(productUrl)
    };
  });
}
