const { StoreModule } = require('./store-module/store.module')

try {
  const store = new StoreModule()
  store.init()
} catch (e) {
  console.log('Init error: ', e)
}