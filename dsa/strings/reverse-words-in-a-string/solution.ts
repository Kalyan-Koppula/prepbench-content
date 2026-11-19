function reverseWords(s: string): string {
  // Scan from the right, picking out words and skipping runs of spaces.
  let result = ''
  let i = s.length - 1
  while (i >= 0) {
    while (i >= 0 && s[i] === ' ') {
      i-- // skip spaces
    }
    if (i < 0) {
      break
    }
    const end = i + 1 // one past the word's last character
    while (i >= 0 && s[i] !== ' ') {
      i--
    }
    if (result.length > 0) {
      result += ' '
    }
    result += s.substring(i + 1, end)
  }
  return result
}
