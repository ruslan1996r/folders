const chalk = require('chalk');

class Logger {
  constructor() {
    this.commands = {
      LIST: { color: "yellow" },
      CREATE: { color: "green" },
      DELETE: { color: "blue" },
      FIND: { color: "white" },
      MOVE: { color: "cyanBright" },
    },
      this.errors = {
        EMPTY: { color: "gray", text: "Store is empty" },
        NOT_FOUND: { color: "red", text: "" },
        UNEXPECTED_ERR: { color: "red", text: "" },
        ALREADY_EXISTS: { color: "magenta", text: "" }
      }
  }
  error(err, msg = "") {
    if (err in this.errors) {
      console.log(chalk[this.errors[err].color](err + ":"), chalk.white(this.errors[err].text, msg))
      return `${err}: ${msg}`
    } else {
      console.log(chalk.red(`Unknown ${err} error`))
    }
  }

  /**
   * @param {String} command 
   * @param {String} rootDirectory
   * @param {String} moveDirectory
   */
  print(command, rootDirectory, moveDirectory) {
    if (command in this.commands) {
      if (command === 'LIST') {
        console.log(chalk[this.commands[command].color](command), chalk.white('\n' + this._log(rootDirectory)))
      } else {
        console.log(chalk[this.commands[command].color](command), chalk.white('\n' + rootDirectory, moveDirectory))
      }
    } else {
      console.log(chalk.red(`Unknown ${command} command`))
    }
  }

  _log(obj, depth = 0) {
    try {
      let logString = ''
      const indent = depth ? new Array(depth).fill('  ').join('') : ''
      for (const key in obj) {
        logString += `${indent}${key}\n`
        if (Object.keys(obj[key]).length) {
          logString += this._log(obj[key], depth + 1)
        }
      }
      return logString
    } catch (e) {
      console.error('[StoreLogger][_log][error]: ', e)
    }
  }
}

module.exports = { Logger }