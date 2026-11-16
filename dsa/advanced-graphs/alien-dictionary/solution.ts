function alienOrder(words: string[]): string {
  const after = new Map<string, Set<string>>() // letter -> letters that must come after it
  const indegree = new Map<string, number>()
  for (const w of words)
    for (const ch of w) {
      if (!after.has(ch)) after.set(ch, new Set())
      indegree.set(ch, 0)
    }

  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i]
    const b = words[i + 1]
    let j = 0
    while (j < a.length && j < b.length && a[j] === b[j]) j++
    if (j === a.length || j === b.length) {
      if (a.length > b.length) return '' // a longer word sits before its own prefix
      continue
    }
    if (!after.get(a[j])!.has(b[j])) {
      after.get(a[j])!.add(b[j])
      indegree.set(b[j], indegree.get(b[j])! + 1)
    }
  }

  const order: string[] = []
  for (const [ch, deg] of indegree) if (deg === 0) order.push(ch)
  for (let head = 0; head < order.length; head++) {
    for (const next of after.get(order[head])!) {
      indegree.set(next, indegree.get(next)! - 1)
      if (indegree.get(next) === 0) order.push(next)
    }
  }
  return order.length === indegree.size ? order.join('') : ''
}
