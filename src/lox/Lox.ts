import fs from 'fs'
import readline from 'readline'
import { Parser } from './Parser'
import { Scanner } from './Scanner'
import { Token } from './Token'
import { TokenType } from './TokenType'

export class Lox {
  static hasError: boolean = false;

  static exec (filename?: string) {
    if (filename) {
      this.runFile(filename)
    } else {
      this.runPrompt()
    }
  }

  static runFile (filename: string) {
    const source = fs.readFileSync(filename).toString()
    this.run(source)

    // Indicate an error in the exit code
    if (this.hasError) {
      process.exit(65)
    }
  }

  static runPrompt () {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '<- '
    })

    rl.prompt()

    rl.on('line', (line) => {
      this.run(line)
      this.hasError = false
      rl.prompt()
    })
  }

  static run (source: string) {
    const scanner = new Scanner(source)
    const tokens = scanner.scanTokens()
    const parser = new Parser(tokens)

    // for (const token of tokens) {
    //  console.log('-> ' + token.toString())
    // }

    console.log(parser.parse())
  }

  static error (lineOrToken: number | Token, message: string) {
    if (typeof lineOrToken === 'number') {
      this.report(lineOrToken, '', message)
    } else if (lineOrToken.type === TokenType.EOF) {
      this.report(lineOrToken.line, ' at end', message)
    } else {
      this.report(lineOrToken.line, ` at '${lineOrToken.lexeme}'`, message)
    }
  }

  static report (line: number, where: string, message: string) {
    console.log(`[line ${line}] Error${where}: ${message}`)
    this.hasError = true
  }
}
