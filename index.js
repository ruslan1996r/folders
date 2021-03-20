const readline = require('readline');

class Store {
  constructor() {
    this.store = {}
  }

  /**
   * @param {Array<String>} dirs Takes a path parsed as an array of strings
   * @param {Object} folder The current directory, which defaults to a store object
   */
  createDir(dirs, folder = this.store) {
    try {
      const result = this.findDir(dirs, folder)
      if (!result.error) {
        return console.log(`This directory already exists`)
      }
      let rootUrl = dirs[0]

      if (rootUrl) {
        if (!folder.hasOwnProperty(rootUrl)) {
          folder[rootUrl] = {}
        }
        this.createDir(dirs.slice(1), folder[rootUrl])
      }
    } catch (e) {
      console.error('[Store][createDir][error]: ', e)
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
        return console.error('[Store][deleteDir][error]: ', result.error)
      }
      const { parentFolder, dirName } = result
      delete parentFolder[dirName]
      console.log(`The "${dirName}" directory has been removed`)
    } catch (e) {
      console.error('[Store][deleteDir][error]: ', e)
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
        return () => console.error('[Store][moveDir][error]: ', result.error)
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
          return console.error('[Store][moveDir][error]: ', result.error)
        }
        const { parentFolder, dirName } = result
        parentFolder[dirName] = Object.assign(parentFolder[dirName], { [sourceDirName]: { ...dirCopy } })
      }
    } catch (e) {
      console.error('[Store][moveDir][error]: ', e)
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
      console.error('[Store][findDir][error]: ', e)
    }
  }
}

class StoreLogger extends Store {
  constructor() {
    super()
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.consoleSubscribe()
  }

  get showList() {
    if (!Object.keys(this.store).length) {
      return console.log('Empty!')
    }
    console.log(this.lg(this.store))
  }

  /**
   * @param {String} url Path as parameter
   * @returns {Array<String>} Will return the parsed path as an array of strings
   */
  parseUrl(url) {
    try {
      if (typeof url === 'string') {
        return url.split('/')
      }
      throw new Error('Url is not a string')
    } catch (e) {
      console.error('[StoreLogger][parseUrl][error]: ', e)
    }
  }

  consoleSubscribe() {
    /**
     * @param {String} input The string accepted by the console
     * @returns {Void}
     */
    this.rl.on('line', (input) => {
      const args = input.split(" ")
      const [command, rootDirectory, moveDirectory] = args

      switch (command) {
        case 'CREATE':
          this.createDir(this.parseUrl(rootDirectory))
          break;
        case 'DELETE':
          this.deleteDir(this.parseUrl(rootDirectory))
          break;
        case 'MOVE':
          this.moveDir(this.parseUrl(rootDirectory))(this.parseUrl(moveDirectory))
          break;
        case 'FIND':
          console.log(this.findDir(this.parseUrl(rootDirectory), this.store))
          break;
        case 'LIST':
          this.showList
          break;
        default:
          this.showList
          break;
      }
    });
  }

  /**
   * @param {Object} obj Directory object
   * @param {Number} depth Parameter indicating the depth of nesting for indentation
   * @returns {String} Will return the parsed line with breaks for the console
   */
  lg(obj, depth = 0) {
    try {
      let logString = ''
      const indent = depth ? new Array(depth).fill('  ').join('') : ''
      for (const key in obj) {
        logString += `${indent}${key}\n`
        if (Object.keys(obj[key]).length) {
          logString += this.lg(obj[key], depth + 1)
        }
      }
      return logString
    } catch (e) {
      console.error('[StoreLogger][lg][error]: ', e)
    }
  }
}

new StoreLogger()