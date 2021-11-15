/* eslint-disable no-use-before-define */

import { Token } from './Token'
import { TokenType } from './TokenType'

export interface Visitor<R> {
  visitBinaryExpr (expr: Binary): R;
  visitGroupingExpr (expr: Grouping): R;
  visitLiteralExpr (expr: Literal): R;
  visitUnaryExpr (expr: Unary): R;
}

export class Expr {
  accept?: <R> (visitor: Visitor<R>) => R;
}

export class Binary extends Expr {
  readonly left: Expr;
  readonly operator: Token;
  readonly right: Expr;

  accept = <R> (visitor: Visitor<R>): R => {
    return visitor.visitBinaryExpr(this)
  }

  constructor (left: Expr, operator: Token, right: Expr) {
    super()

    this.left = left
    this.operator = operator
    this.right = right
  }
}

export class Grouping extends Expr {
  readonly expression: Expr;

  accept = <R> (visitor: Visitor<R>): R => {
    return visitor.visitGroupingExpr(this)
  }

  constructor (expression: Expr) {
    super()
    this.expression = expression
  }
}

export class Literal extends Expr {
  readonly value: unknown;

  accept = <R> (visitor: Visitor<R>): R => {
    return visitor.visitLiteralExpr(this)
  }

  constructor (value: unknown) {
    super()
    this.value = value
  }
}

export class Unary extends Expr {
  readonly operator: Token;
  readonly right: Expr;

  accept = <R> (visitor: Visitor<R>): R => {
    return visitor.visitUnaryExpr(this)
  }

  constructor (operator: Token, right: Expr) {
    super()
    this.operator = operator
    this.right = right
  }
}

export class AstPrinter implements Visitor<string> {
  static test () {
    const expr = new Binary(
      new Unary(
        new Token(TokenType.MINUS, '-', null, 1),
        new Literal(123)
      ),
      new Token(TokenType.STAR, '*', null, 1),
      new Grouping(new Literal(45.67))
    )

    const astPrinter = new AstPrinter()

    console.log(astPrinter.print(expr))
  }

  print (expr: Expr): string {
    return expr.accept?.(this) || ''
  }

  parenthesize (name: string, ...exprs: Expr[]) {
    const builder: string[] = []

    builder.push('(')
    builder.push(name)

    exprs.forEach((expr) => {
      builder.push(' ')
      builder.push(expr.accept?.(this) || '')
    })

    builder.push(')')

    return builder.join('')
  }

  visitBinaryExpr (expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
  }

  visitGroupingExpr (expr: Grouping): string {
    return this.parenthesize('group', expr.expression)
  }

  visitLiteralExpr (expr: Literal): string {
    return expr.value === null || expr.value === undefined
      ? 'nil'
      : `${expr.value}`
  }

  visitUnaryExpr (expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right)
  }
}
