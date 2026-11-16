function partitionLabels(s: string): number[] {
  const sizes: number[] = []
  let start = 0
  while (start < s.length) {
    // shortest prefix of the rest that shares no letter with what follows it
    for (let end = start; end < s.length; end++) {
      const left = new Set(s.slice(start, end + 1))
      const right = s.slice(end + 1)
      if (![...right].some((ch) => left.has(ch))) {
        sizes.push(end - start + 1)
        start = end + 1
        break
      }
    }
  }
  return sizes
}
