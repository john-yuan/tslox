import { Lox } from './Lox'
import { Token } from './Token'
import { TokenType } from './TokenType'

const keywords: {
  [key: string]: TokenType;
} = {
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE
}

export class Scanner {
  readonly source: string;
  readonly tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;

  constructor (source: string) {
    this.source = source
  }

  scanTokens () {
    while (!this.isAtEnd()) {
      // We are at the beginning of the next lexeme.
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push(new Token(TokenType.EOF, '', null, this.line))

    return this.tokens
  }

  private isAtEnd () {
    return this.current >= this.source.length
  }

  private scanToken () {
    const c = this.advance()

    switch (c) {
      case '(': this.addToken(TokenType.LEFT_PAREN); break
      case ')': this.addToken(TokenType.RIGHT_PAREN); break
      case '{': this.addToken(TokenType.LEFT_BRACE); break
      case '}': this.addToken(TokenType.RIGHT_BRACE); break
      case ',': this.addToken(TokenType.COMMA); break
      case '.': this.addToken(TokenType.DOT); break
      case '-': this.addToken(TokenType.MINUS); break
      case '+': this.addToken(TokenType.PLUS); break
      case ';': this.addToken(TokenType.SEMICOLON); break
      case '*': this.addToken(TokenType.STAR); break
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG)
        break
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL)
        break
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS)
        break
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER)
        break
      case '/':
        if (this.match('/')) {
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance()
        } else {
          this.addToken(TokenType.SLASH)
        }
        break
      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break
      case '\n':
        this.line += 1
        break
      case '"':
        this.string()
        break
      default:
        if (this.isDigit(c)) {
          this.number()
        } else if (this.isAlphaNumeric(c)) {
          this.identifier()
        } else {
          Lox.error(this.line, 'Unexpected character.')
        }
    }
  }

  private number () {
    while (this.isDigit(this.peek())) this.advance()

    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance()

      while (this.isDigit(this.peek())) this.advance()
    }

    this.addToken(TokenType.NUMBER, +this.source.substring(this.start, this.current))
  }

  private identifier () {
    while (this.isAlphaNumeric(this.peek())) this.advance()

    const text = this.source.substring(this.start, this.current)
    const type = keywords[text]

    this.addToken(type || TokenType.IDENTIFIER)
  }

  private string () {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line += 1
      }

      this.advance()
    }

    if (this.isAtEnd()) {
      Lox.error(this.line, 'Unterminated string.')
      return
    }

    // The closing ".
    this.advance()

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1)

    this.addToken(TokenType.STRING, value)
  }

  private match (expected: string) {
    if (this.isAtEnd()) return false
    if (this.source.charAt(this.current) !== expected) return false

    this.current += 1

    return true
  }

  private peek () {
    if (this.isAtEnd()) return '\0'
    return this.source.charAt(this.current)
  }

  private peekNext () {
    if (this.current + 1 > this.source.length) return '\0'

    return this.source.charAt(this.current + 1)
  }

  private isDigit (ch: string) {
    return /^[0-9]$/.test(ch)
  }

  private isAlpha (ch: string) {
    return /^[_a-zA-Z]$/.test(ch)
  }

  private isAlphaNumeric (ch: string) {
    return this.isAlpha(ch) || this.isDigit(ch)
  }

  private advance () {
    return this.source.charAt(this.current++)
  }

  private addToken (type: TokenType, literal: any = null) {
    const lexeme = this.source.substring(this.start, this.current)
    this.tokens.push(new Token(type, lexeme, literal, this.line))
  }
}
