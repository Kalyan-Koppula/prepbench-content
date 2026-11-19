function alienOrder(words: string[]): string {
  // Letters are indices 0..25. after[a][b]: a must come before b.
  const present = new Array(26).fill(false)
  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < words[i].length; j++) {
      present[words[i].charCodeAt(j) - 97] = true
    }
  }
  const after: boolean[][] = []
  for (let a = 0; a < 26; a++) {
    after.push(new Array(26).fill(false))
  }
  const incoming = new Array(26).fill(0)

  // Each adjacent pair of words gives at most one rule: their first difference.
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i]
    const b = words[i + 1]
    let j = 0
    while (j < a.length && j < b.length && a[j] === b[j]) {
      j++
    }
    if (j === a.length || j === b.length) {
      if (a.length > b.length) {
        return '' // a longer word listed before its own prefix: impossible
      }
      continue
    }
    const x = a.charCodeAt(j) - 97
    const y = b.charCodeAt(j) - 97
    if (!after[x][y]) {
      after[x][y] = true
      incoming[y]++
    }
  }

  // Kahn's topological sort over the letters that appear.
  const order: number[] = []
  let letters = 0
  for (let c = 0; c < 26; c++) {
    if (present[c]) {
      letters++
      if (incoming[c] === 0) {
        order.push(c)
      }
    }
  }
  let head = 0
  while (head < order.length) {
    const c = order[head]
    head++
    for (let d = 0; d < 26; d++) {
      if (after[c][d]) {
        incoming[d]--
        if (incoming[d] === 0) {
          order.push(d)
        }
      }
    }
  }
  if (order.length < letters) {
    return '' // a cycle: the rules contradict each other
  }
  let result = ''
  for (let i = 0; i < order.length; i++) {
    result += String.fromCharCode(97 + order[i])
  }
  return result
}
