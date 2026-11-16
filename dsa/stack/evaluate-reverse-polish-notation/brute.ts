function evalRPN(tokens: string[]): number {
  // Rewrite the leftmost "number number operator" triple until one value remains.
  const items = [...tokens]
  const isOp = (t: string) => t === '+' || t === '-' || t === '*' || t === '/'
  while (items.length > 1) {
    const i = items.findIndex((t, j) => j >= 2 && isOp(t) && !isOp(items[j - 1]) && !isOp(items[j - 2]))
    const a = Number(items[i - 2])
    const b = Number(items[i - 1])
    const op = items[i]
    const v = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : Math.trunc(a / b)
    items.splice(i - 2, 3, String(v))
  }
  return Number(items[0])
}
