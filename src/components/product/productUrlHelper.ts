import getUrls from 'get-urls';
import { URL } from 'url';
import countries from '../../config/countries';

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

    const tld = _url.hostname.replace('www.', '').replace('amazon', '');

    if (!countries.allowed_countries.includes(tld)) {
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
    return splittedPathname.length > 3 ? splittedPathname[5] : splittedPathname[2];
  }

  console.error('ASIN parse edilemedi?', { splittedPathname });

  return '';
}
