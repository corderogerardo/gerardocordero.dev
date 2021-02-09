const urlsHashMap = {
  short: {},
  long: {},
};

function urlShortener(longURL) {
  const shortUrl = Math.random()
    .toString(36)
    .substring(2, 15)
    .toLowerCase()
    .replace(/[0-9]/g, "")
    .slice(0, 4);
  const shortly = `short.ly/${shortUrl}`;

  if (!!urlsHashMap.long[longURL]) {
    return urlsHashMap.long[longURL];
  }

  urlsHashMap.short[shortly] = longURL;
  urlsHashMap.long[longURL] = shortly;

  return shortly;
}

function urlRedirector(shortURL) {
  return urlsHashMap.short[shortURL];
}

// Another solution I like!
let data = {};

function urlShortener2(longURL) {
  let shortURL = "short.ly/" + longURL.replace(/[^a-z]/g, "").slice(-4);
  if (!data[shortURL]) data[shortURL] = longURL;
  return shortURL;
}

function urlRedirector2(shortURL) {
  return data[shortURL];
}
