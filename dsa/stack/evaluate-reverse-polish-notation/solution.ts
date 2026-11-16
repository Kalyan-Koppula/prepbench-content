function evalRPN(tokens: string[]): number {
  const stack: number[] = []
  for (const tok of tokens) {
    if (tok === '+' || tok === '-' || tok === '*' || tok === '/') {
      const b = stack.pop()! // right operand is on top
      const a = stack.pop()!
      if (tok === '+') stack.push(a + b)
      else if (tok === '-') stack.push(a - b)
      else if (tok === '*') stack.push(a * b)
      else stack.push(Math.trunc(a / b))
    } else {
      stack.push(Number(tok))
    }
  }
  return stack[0]
}
