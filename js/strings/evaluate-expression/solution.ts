type Token = { type: 'num'; value: number } | { type: 'op'; value: string }

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  const pattern = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|([-+*/()]))/y
  let index = 0
  while (index < input.length) {
    if (/^\s*$/.test(input.slice(index))) break
    pattern.lastIndex = index
    const match = pattern.exec(input)
    if (!match) throw new SyntaxError(`Unexpected character at position ${index}`)
    tokens.push(match[1] !== undefined ? { type: 'num', value: parseFloat(match[1]) } : { type: 'op', value: match[2] })
    index = pattern.lastIndex
  }
  return tokens
}

function evaluate(expression: string): number {
  const tokens = tokenize(expression)
  let pos = 0
  const peek = () => tokens[pos]
  const isOp = (value: string) => peek()?.type === 'op' && peek().value === value

  // expression := term (('+' | '-') term)*
  const parseExpression = (): number => {
    let value = parseTerm()
    while (isOp('+') || isOp('-')) {
      const op = tokens[pos++].value
      const right = parseTerm()
      value = op === '+' ? value + right : value - right
    }
    return value
  }

  // term := factor (('*' | '/') factor)*
  const parseTerm = (): number => {
    let value = parseFactor()
    while (isOp('*') || isOp('/')) {
      const op = tokens[pos++].value
      const right = parseFactor()
      value = op === '*' ? value * right : value / right
    }
    return value
  }

  // factor := ('-' | '+') factor | number | '(' expression ')'
  const parseFactor = (): number => {
    const token = tokens[pos++]
    if (!token) throw new SyntaxError('Unexpected end of expression')
    if (token.type === 'num') return token.value
    if (token.value === '-') return -parseFactor()
    if (token.value === '+') return parseFactor()
    if (token.value === '(') {
      const value = parseExpression()
      if (!isOp(')')) throw new SyntaxError('Expected )')
      pos++
      return value
    }
    throw new SyntaxError(`Unexpected ${token.value}`)
  }

  const result = parseExpression()
  if (pos < tokens.length) throw new SyntaxError(`Unexpected ${String(tokens[pos].value)}`)
  return result
}
