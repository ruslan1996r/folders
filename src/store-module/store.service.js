const { Logger } = require('../utils/logger')

class StoreService {
  constructor() {
    this.store = {}
    this.Log = new Logger()
  }

  get showList() {
    if (!Object.keys(this.store).length) {
      return this.Log.error('EMPTY')
    }
    this.Log.print('LIST', this.store)
  }
  /**
   * @param {Array<String>} dirs Takes a path parsed as an array of strings
   * @param {Object} folder The current directory, which defaults to a store object
   */
  createDir(dirs, folder = this.store) {
    try {
      const result = this.findDir(dirs, folder)
      if (!result.error) {
        return this.Log.error('ALREADY_EXISTS', result.dirName)
      }
      let rootUrl = dirs[0]

      if (rootUrl && !folder.hasOwnProperty(rootUrl)) {
        folder[rootUrl] = {}
      } else if (rootUrl) {
        this.createDir(dirs.slice(1), folder[rootUrl])
      }
    } catch (e) {
      this.Log.error('UNEXPECTED_ERR', e)
    }
  }

  /**
   * @param {Array<String>} dirs Takes a path parsed as an array of strings
   * @param {Object} folder The current directory, which defaults to a store object
   * @returns {Void}
   */
  deleteDir(dirs, folder = this.store) {
    try {
      const result = this.findDir(dirs, folder)
      if (result.error) {
        return this.Log.error('NOT_FOUND', result.error)
      }
      const { parentFolder, dirName } = result
      delete parentFolder[dirName]
      console.log(`The "${dirName}" directory has been removed`)
    } catch (e) {
      this.Log.error('UNEXPECTED_ERR', e)
    }
  }

  /**
   * @param {String} dirsFrom The path from which to extract the directory
   * @param {Object} folder The current directory, which defaults to a store object
   * @returns {Function} Function that will take the new path
   */
  moveDir(dirsFrom, folder = this.store) {
    try {
      const result = this.findDir(dirsFrom, folder)
      if (result.error) {
        return () => this.Log.error('NOT_FOUND', result.error)
      }
      const { parentFolder, dirName } = result
      const dirCopy = { ...parentFolder[dirName] }
      const sourceDirName = dirName
      delete parentFolder[dirName]

      /**
       * @param {String} dirsTo The way in which will be moved to the specified directory
       * @returns {Void}
       */
      return (dirsTo) => {
        const result = this.findDir(dirsTo, folder)
        if (result.error) {
          return this.Log.error('NOT_FOUND', result.error)
        }
        const { parentFolder, dirName } = result
        parentFolder[dirName] = Object.assign(parentFolder[dirName], { [sourceDirName]: { ...dirCopy } })
      }
    } catch (e) {
      this.Log.error('UNEXPECTED_ERR', e)
    }
  }

  /**
   * @param {Array<String>} dirs Takes a path parsed as an array of strings
   * @param {Object} folder The current directory, which defaults to a store object
   * @returns {Object|String} Will return the found directory or error notification
   */
  findDir(dirs, folder) {
    try {
      let [rootUrl, nextDirUrl] = dirs

      if (!folder.hasOwnProperty(rootUrl)) {
        return { error: `Directory "${rootUrl}" not found` }
      }

      if (nextDirUrl) {
        return this.findDir(dirs.slice(1), folder[rootUrl])
      } else {
        return {
          dirName: rootUrl,
          parentFolder: folder,
          dir: folder[rootUrl],
        }
      }
    } catch (e) {
      this.Log.error('UNEXPECTED_ERR', e)
    }
  }
}

module.exports = { StoreService }