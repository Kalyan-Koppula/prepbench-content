function isOperator(token: string): boolean {
  return token === '+' || token === '-' || token === '*' || token === '/'
}

function apply(left: number, right: number, op: string): number {
  if (op === '+') {
    return left + right
  }
  if (op === '-') {
    return left - right
  }
  if (op === '*') {
    return left * right
  }
  return Math.trunc(left / right)
}

function evalRPN(tokens: string[]): number {
  // Repeatedly find the leftmost "number number operator" triple and replace it
  // with its value. Each rewrite rebuilds the list, so this is O(n^2).
  let items = tokens.slice()
  while (items.length > 1) {
    let i = 2
    while (!(isOperator(items[i]) && !isOperator(items[i - 1]) && !isOperator(items[i - 2]))) {
      i++
    }
    const value = apply(parseInt(items[i - 2], 10), parseInt(items[i - 1], 10), items[i])
    const next: string[] = []
    for (let j = 0; j < items.length; j++) {
      if (j === i - 2) {
        next.push(String(value))
      } else if (j !== i - 1 && j !== i) {
        next.push(items[j])
      }
    }
    items = next
  }
  return parseInt(items[0], 10)
}
