function isValid(s: string): boolean {
  const partner: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
  const stack: string[] = []
  for (const ch of s) {
    if (ch in partner) {
      if (stack.pop() !== partner[ch]) return false
    } else {
      stack.push(ch)
    }
  }
  return stack.length === 0
}
