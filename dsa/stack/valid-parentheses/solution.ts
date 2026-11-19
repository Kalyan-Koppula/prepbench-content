function isValid(s: string): boolean {
  const stack: string[] = [] // openers still waiting for their closer
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch)
      continue
    }
    // A closer must match the most recent unclosed opener.
    if (stack.length === 0) {
      return false
    }
    const open = stack.pop()
    if (ch === ')' && open !== '(') {
      return false
    }
    if (ch === ']' && open !== '[') {
      return false
    }
    if (ch === '}' && open !== '{') {
      return false
    }
  }
  return stack.length === 0 // leftover openers were never closed
}
