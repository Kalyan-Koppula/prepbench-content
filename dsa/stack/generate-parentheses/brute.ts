function generateParenthesis(n: number): string[] {
  const result: string[] = []

  function isBalanced(s: string): boolean {
    let balance = 0
    for (let i = 0; i < s.length; i++) {
      if (s[i] === '(') {
        balance++
      } else {
        balance--
      }
      if (balance < 0) {
        return false
      }
    }
    return balance === 0
  }

  // Build all 2^(2n) strings of '(' and ')', keeping the balanced ones.
  function build(current: string): void {
    if (current.length === 2 * n) {
      if (isBalanced(current)) {
        result.push(current)
      }
      return
    }
    build(current + '(')
    build(current + ')')
  }

  build('')
  return result
}
