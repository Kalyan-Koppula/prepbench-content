function alienOrder(words: string[]): string {
  // Same rules, ordered with a DFS topological sort (three colours).
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
  for (let i = 0; i + 1 < words.length; i++) {
    const a = words[i]
    const b = words[i + 1]
    let j = 0
    while (j < a.length && j < b.length && a[j] === b[j]) {
      j++
    }
    if (j === a.length || j === b.length) {
      if (a.length > b.length) {
        return ''
      }
      continue
    }
    after[a.charCodeAt(j) - 97][b.charCodeAt(j) - 97] = true
  }
  const state = new Array(26).fill(0) // 0 new, 1 on path, 2 done
  const finished: number[] = []

  function visit(c: number): boolean {
    if (state[c] === 1) {
      return false // cycle
    }
    if (state[c] === 2) {
      return true
    }
    state[c] = 1
    for (let d = 0; d < 26; d++) {
      if (after[c][d] && !visit(d)) {
        return false
      }
    }
    state[c] = 2
    finished.push(c)
    return true
  }

  for (let c = 0; c < 26; c++) {
    if (present[c] && !visit(c)) {
      return ''
    }
  }
  let result = ''
  for (let i = finished.length - 1; i >= 0; i--) {
    result += String.fromCharCode(97 + finished[i])
  }
  return result
}
