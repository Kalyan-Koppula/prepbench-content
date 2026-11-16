function check(args: any[], output: any, expected: any): boolean | string {
  const words = args[0] as string[]
  if (typeof output !== 'string') return 'expected a string'

  const letters = new Set(words.join(''))
  const edges: string[][] = []
  let prefixViolation = false
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i]
    const b = words[i + 1]
    let j = 0
    while (j < a.length && j < b.length && a[j] === b[j]) j++
    if (j < a.length && j < b.length) edges.push([a[j], b[j]])
    else if (a.length > b.length) prefixViolation = true
  }

  // Is any order possible? (Kahn's algorithm over the letters.)
  let possible = !prefixViolation
  if (possible) {
    const indeg = new Map<string, number>([...letters].map((c) => [c, 0]))
    const uniq = [...new Set(edges.map((e) => e.join('')))]
    for (const e of uniq) indeg.set(e[1], indeg.get(e[1])! + 1)
    const queue = [...letters].filter((c) => indeg.get(c) === 0)
    for (let h = 0; h < queue.length; h++)
      for (const e of uniq) if (e[0] === queue[h]) {
        indeg.set(e[1], indeg.get(e[1])! - 1)
        if (indeg.get(e[1]) === 0) queue.push(e[1])
      }
    possible = queue.length === letters.size
  }

  if (!possible) return output === '' ? true : 'no alphabet is consistent with these words, so the answer is ""'
  if (output.length !== letters.size) return `expected ${letters.size} distinct letters, got ${output.length} characters`
  const pos = new Map<string, number>()
  for (let i = 0; i < output.length; i++) {
    const ch = output[i]
    if (!letters.has(ch)) return `"${ch}" does not appear in the words`
    if (pos.has(ch)) return `"${ch}" appears twice`
    pos.set(ch, i)
  }
  for (const [a, b] of edges) if (pos.get(a)! > pos.get(b)!) return `"${a}" must come before "${b}"`
  return true
}
