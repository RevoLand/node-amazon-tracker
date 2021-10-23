const getUrls = require('get-urls');

const parseProductUrls = (text: string) => {
  let urls = Array.from<string>(getUrls(text, {
    forceHttps: true,
    removeSingleSlash: true,
    removeTrailingSlash: true,
    sortQueryParameters: false,
    stripWWW: false
  }));

  urls = urls.filter(url => url.includes('amazon.'));

  return urls;
};

export default parseProductUrls;
