// Collect the words left to right into a list, then join them in reverse order.
function reverseWords(s: string): string {
  const words: string[] = []
  let current = ''
  for (let i = 0; i < s.length; i++) {
    if (s[i] === ' ') {
      if (current.length > 0) {
        words.push(current)
        current = ''
      }
    } else {
      current += s[i]
    }
  }
  if (current.length > 0) {
    words.push(current)
  }
  let result = ''
  for (let k = words.length - 1; k >= 0; k--) {
    result += words[k]
    if (k > 0) {
      result += ' '
    }
  }
  return result
}
