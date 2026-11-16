function reverseWords(s: string): string {
  const words: string[] = []
  let i = s.length - 1
  while (i >= 0) {
    while (i >= 0 && s[i] === ' ') i--
    if (i < 0) break
    const end = i + 1
    while (i >= 0 && s[i] !== ' ') i--
    words.push(s.slice(i + 1, end))
  }
  return words.join(' ')
}
