import { Binary, Expr, Grouping, Literal, Unary } from './Expr'
import { Lox } from './Lox'
import { Token } from './Token'
import { TokenType } from './TokenType'

export class Parser {
  private readonly tokens: Token[];
  private current = 0;

  constructor (tokens: Token[]) {
    this.tokens = tokens
  }

  parse () {
    try {
      return this.expression()
    } catch (e) {
      console.log(e)
      return null
    }
  }

  private expression () {
    return this.equality()
  }

  private equality () {
    let expr = this.comparison()

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous()
      const right = this.comparison()
      expr = new Binary(expr, operator, right)
    }

    return expr
  }

  private comparison () {
    let expr = this.term()

    while (this.match(
      TokenType.GREATER, TokenType.GREATER_EQUAL,
      TokenType.LESS, TokenType.LESS_EQUAL
    )) {
      const operator = this.previous()
      const right = this.term()
      expr = new Binary(expr, operator, right)
    }

    return expr
  }

  private term () {
    let expr = this.factor()

    while (this.match(
      TokenType.PLUS, TokenType.MINUS
    )) {
      const operator = this.previous()
      const right = this.factor()
      expr = new Binary(expr, operator, right)
    }

    return expr
  }

  private factor () {
    let expr = this.unary()

    while (this.match(
      TokenType.STAR, TokenType.SLASH
    )) {
      const operator = this.previous()
      const right = this.unary()
      expr = new Binary(expr, operator, right)
    }

    return expr
  }

  private unary (): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.unary()
      return new Unary(operator, right)
    }

    return this.primary()
  }

  private primary (): Expr {
    if (this.match(TokenType.TRUE)) return new Literal(true)
    if (this.match(TokenType.FALSE)) return new Literal(false)
    if (this.match(TokenType.NIL)) return new Literal(null)

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal)
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression()

      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")

      return new Grouping(expr)
    }

    const token = this.peek()

    throw new Error(`Unexpected '${token.lexeme}' at line ${token.line}, expect an expression.`)
  }

  private match (...types: TokenType[]) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }

    return false
  }

  private check (type: TokenType) {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  private isAtEnd () {
    return this.peek().type === TokenType.EOF
  }

  private peek () {
    return this.tokens[this.current]
  }

  private previous () {
    return this.tokens[this.current - 1]
  }

  private consume (type: TokenType, message: string) {
    if (this.check(type)) return this.advance()
    throw this.error(this.peek(), message)
  }

  private error (token: Token, message: string) {
    Lox.error(token, message)
    return new SyntaxError()
  }

  private advance () {
    this.current += 1
  }
}
