function alienOrder(words: string[]): string {
  const letters = [...new Set(words.join(''))].sort()
  const before = new Set<string>() // "ab" means a before b
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i]
    const b = words[i + 1]
    let j = 0
    while (j < a.length && j < b.length && a[j] === b[j]) j++
    if (j < a.length && j < b.length) before.add(a[j] + b[j])
    else if (a.length > b.length) return ''
  }
  // Repeatedly emit any letter with no unplaced letter required before it.
  const out: string[] = []
  const placed = new Set<string>()
  while (out.length < letters.length) {
    const pick = letters.find((x) => !placed.has(x) && !letters.some((y) => !placed.has(y) && before.has(y + x)))
    if (pick === undefined) return ''
    placed.add(pick)
    out.push(pick)
  }
  return out.join('')
}
