function checkValidString(s: string): boolean {
  // Set of every reachable open-count.
  let states = new Set<number>([0])
  for (const ch of s) {
    const next = new Set<number>()
    for (const open of states) {
      if (ch === '(' || ch === '*') next.add(open + 1)
      if ((ch === ')' || ch === '*') && open > 0) next.add(open - 1)
      if (ch === '*') next.add(open)
    }
    states = next
  }
  return states.has(0)
}
