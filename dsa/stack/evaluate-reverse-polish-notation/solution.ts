function evalRPN(tokens: string[]): number {
  const stack: number[] = [] // operands waiting for an operator
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '+' || token === '-' || token === '*' || token === '/') {
      // The right operand was pushed last, so it comes off first.
      const right = stack.pop() as number
      const left = stack.pop() as number
      if (token === '+') {
        stack.push(left + right)
      } else if (token === '-') {
        stack.push(left - right)
      } else if (token === '*') {
        stack.push(left * right)
      } else {
        stack.push(Math.trunc(left / right)) // integer division toward zero
      }
    } else {
      stack.push(parseInt(token, 10))
    }
  }
  return stack[0]
}
