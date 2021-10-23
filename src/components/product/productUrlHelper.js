const getUrls = require('get-urls');

const parseProductUrls = (text) => {
  let urls = Array.from(getUrls(text, {
    forceHttps: true,
    removeSingleSlash: true,
    removeTrailingSlash: true,
    sortQueryParameters: false,
    stripWWW: false
  }));

  urls = urls.filter(url => url.includes('amazon.'));

  return urls;
};

exports.parseProductUrls = parseProductUrls;
