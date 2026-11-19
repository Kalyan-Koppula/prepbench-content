function partitionLabels(s: string): number[] {
  // last[c] = the last index where letter c appears.
  const last = new Array(26).fill(-1)
  for (let i = 0; i < s.length; i++) {
    last[s.charCodeAt(i) - 97] = i
  }
  const sizes: number[] = []
  let start = 0
  let end = 0 // the current piece must reach at least this far
  for (let i = 0; i < s.length; i++) {
    const lastOfThis = last[s.charCodeAt(i) - 97]
    if (lastOfThis > end) {
      end = lastOfThis
    }
    if (i === end) {
      sizes.push(end - start + 1) // no letter in [start, end] appears later
      start = i + 1
    }
  }
  return sizes
}
