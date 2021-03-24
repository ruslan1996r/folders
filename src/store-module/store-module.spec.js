const { StoreService } = require("./store.service")
const { parseUrl } = require('../utils/urlParser')

describe('StoreService', () => {
  let _StoreService = null
  beforeEach(() => {
    _StoreService = new StoreService()
  })

  it("[Create] directory", () => {
    _StoreService.createDir(parseUrl('foods'))
    const expected = { foods: {} }
    expect(_StoreService.store).toEqual(expected)
  })

  it("[Create] directory with children", () => {
    _StoreService.createDir(parseUrl('foods/fruits'))
    _StoreService.createDir(parseUrl('foods/vegetables'))

    const expected = {
      foods: {
        fruits: {},
        vegetables: {}
      }
    }
    expect(_StoreService.store).toEqual(expected)
  })

  it("[Delete] directory", () => {
    _StoreService.createDir(parseUrl('foods/fruits'))
    _StoreService.createDir(parseUrl('foods/vegetables'))
    _StoreService.deleteDir(parseUrl('foods/vegetables'))

    const expected = {
      foods: {
        fruits: {},
      }
    }
    expect(_StoreService.store).toEqual(expected)
  })

  it("[Move] directory", () => {
    _StoreService.createDir(parseUrl('vegetables'))
    _StoreService.createDir(parseUrl('grains/squash'))
    _StoreService.moveDir(parseUrl('grains/squash'))(parseUrl('vegetables'))

    const expected = {
      grains: {},
      vegetables: {
        squash: {}
      }
    }
    expect(_StoreService.store).toEqual(expected)
  })

  it("[Exists] squash should exists in grains", () => {
    _StoreService.createDir(parseUrl('grains'))
    _StoreService.createDir(parseUrl('grains/squash'))

    const { dirName, parentFolder, dir } = _StoreService.findDir(parseUrl('grains/squash'), _StoreService.store)

    expect(dirName).toBe('squash')
    expect(parentFolder).toEqual({ squash: {} })
    expect(dir).toEqual({})
  })

  it("[Exists] directory already exists", () => {
    _StoreService.createDir(parseUrl('fruits'))
    _StoreService.createDir(parseUrl('fruits/apples'))

    const message = _StoreService.createDir(parseUrl('fruits/apples'))
    expect(message).toBe('ALREADY_EXISTS: apples')
  })

  it("[Not found]", () => {
    _StoreService.createDir(parseUrl('fruits'))
    _StoreService.createDir(parseUrl('vegetables'))

    const { error } = _StoreService.findDir(parseUrl('fruits/apples'), _StoreService.store)
    expect(error).toBe('Directory "apples" not found')
  })
})
