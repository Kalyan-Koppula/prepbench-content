function check(args: any[], output: any, expected: any): boolean | string {
  const [n, prereqs] = args as [number, number[][]]

  // Decide independently whether any valid order exists (Kahn's algorithm).
  const adj: number[][] = Array.from({ length: n }, () => [])
  const indeg = new Array(n).fill(0)
  for (const [a, b] of prereqs) {
    adj[b].push(a)
    indeg[a]++
  }
  const queue: number[] = []
  for (let v = 0; v < n; v++) if (indeg[v] === 0) queue.push(v)
  for (let h = 0; h < queue.length; h++) for (const w of adj[queue[h]]) if (--indeg[w] === 0) queue.push(w)
  const possible = queue.length === n

  if (!Array.isArray(output)) return 'expected an array'
  if (!possible) return output.length === 0 ? true : 'the prerequisites contain a cycle, so the answer is []'
  if (output.length !== n) return `expected all ${n} courses, got ${output.length}`

  const pos = new Array(n).fill(-1)
  for (let i = 0; i < n; i++) {
    const c = output[i]
    if (!Number.isInteger(c) || c < 0 || c >= n) return `invalid course ${JSON.stringify(c)}`
    if (pos[c] !== -1) return `course ${c} appears twice`
    pos[c] = i
  }
  for (const [a, b] of prereqs) if (pos[b] > pos[a]) return `course ${b} must come before course ${a}`
  return true
}
