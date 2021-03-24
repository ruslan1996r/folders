const parseUrl = function (url) {
  try {
    if (typeof url === 'string') {
      return url.split('/')
    }
    throw new Error('Url is not a string')
  } catch (e) {
    console.error('[StoreLogger][parseUrl][error]: ', e)
  }
}

module.exports = { parseUrl }