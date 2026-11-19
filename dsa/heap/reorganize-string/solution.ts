function reorganizeString(s: string): string {
  const counts = new Array(26).fill(0)
  for (let i = 0; i < s.length; i++) {
    counts[s.charCodeAt(i) - 97]++
  }
  // Max-heap of letter indices by remaining count (ties by letter, for stable output).
  const heap = new PriorityQueue<number>((a, b) => {
    if (counts[a] !== counts[b]) {
      return counts[b] - counts[a]
    }
    return a - b
  })
  for (let c = 0; c < 26; c++) {
    if (counts[c] > 0) {
      heap.push(c)
    }
  }

  let result = ''
  let held = -1 // the letter just placed; it can't be placed next
  while (!heap.isEmpty()) {
    const c = heap.pop() as number // most frequent letter other than `held`
    result += String.fromCharCode(97 + c)
    counts[c]--
    if (held !== -1) {
      heap.push(held) // the previous letter may be used again
    }
    held = counts[c] > 0 ? c : -1
  }
  // Copies of the held letter left over means we got stuck next to it.
  return held === -1 ? result : ''
}
