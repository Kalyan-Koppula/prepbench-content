function reorganizeString(s: string): string {
  const counts = new Map<string, number>()
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1)

  // Max-heap of [count, char]; ties broken by char for determinism.
  const heap = new PriorityQueue<[number, string]>((a, b) => b[0] - a[0] || (a[1] < b[1] ? -1 : 1))
  for (const [ch, c] of counts) heap.push([c, ch])

  const out: string[] = []
  let held: [number, string] | null = null // the letter just used; can't go next
  while (!heap.isEmpty()) {
    const [c, ch] = heap.pop()!
    out.push(ch)
    if (held) heap.push(held)
    held = c > 1 ? [c - 1, ch] : null
  }
  // Leftover copies of the held letter mean we got stuck.
  return held ? '' : out.join('')
}
