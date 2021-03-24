const readline = require('readline');
const path = require("path")
const fs = require('fs')
const { StoreService } = require("./store.service")
const { Logger } = require('../utils/logger')
const { parseUrl } = require('../utils/urlParser')

class StoreModule extends StoreService {
  constructor() {
    super()
    this.Log = new Logger()
    this.rl = readline.createInterface({
      input: process.stdin,
    });
  }
  init() {
    this.consoleSubscribe()
    this.readDb()
  }
  consoleSubscribe() {
    /**
     * @param {String} input The string accepted by the console
     * @returns {Void}
     */
    this.rl.on('line', (input) => {
      this.callCommand(input)
    });
  }

  readDb() {
    try {
      const commandsPath = path.resolve(__dirname, '..', 'db', 'commands.txt')
      const commandsFile = fs.readFileSync(commandsPath, { encoding: 'utf-8' })
      const commands = commandsFile.split(/\r?\n/)
      if (commands.length) {
        commands.forEach(command => this.callCommand(command))
      }
    } catch (e) {
      console.error('[readDb][error]: ', e)
    }
  }

  callCommand(input) {
    const args = input.split(" ")
    const [command, rootDirectory, moveDirectory] = args

    switch (command) {
      case 'CREATE':
        this.createDir(parseUrl(rootDirectory))
        this.Log.print(command, rootDirectory)
        break;
      case 'DELETE':
        this.deleteDir(parseUrl(rootDirectory))
        this.Log.print(command, rootDirectory)
        break;
      case 'MOVE':
        this.moveDir(parseUrl(rootDirectory))(parseUrl(moveDirectory))
        this.Log.print(command, rootDirectory, moveDirectory)
        break;
      case 'FIND':
        this.findDir(parseUrl(rootDirectory), this.store)
        this.Log.print(command, rootDirectory)
        break;
      case 'LIST':
        this.showList
        break;
      default:
        this.showList
        break;
    }
  }
}

module.exports = { StoreModule }