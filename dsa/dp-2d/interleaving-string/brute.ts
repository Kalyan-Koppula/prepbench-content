// Graph search over (used from s1, used from s2) states.
function isInterleave(s1: string, s2: string, s3: string): boolean {
  if (s1.length + s2.length !== s3.length) return false
  const seen = new Set<string>()
  const stack: [number, number][] = [[0, 0]]
  while (stack.length) {
    const [i, j] = stack.pop()!
    if (i === s1.length && j === s2.length) return true
    const key = i + ',' + j
    if (seen.has(key)) continue
    seen.add(key)
    if (i < s1.length && s1[i] === s3[i + j]) stack.push([i + 1, j])
    if (j < s2.length && s2[j] === s3[i + j]) stack.push([i, j + 1])
  }
  return false
}
