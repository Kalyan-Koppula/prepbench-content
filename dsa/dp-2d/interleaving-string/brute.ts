// Depth-first search over states (characters used from s1, characters used from s2),
// visiting each state at most once.
function isInterleave(s1: string, s2: string, s3: string): boolean {
  const m = s1.length
  const n = s2.length
  if (m + n !== s3.length) {
    return false
  }
  const visited = new Array((m + 1) * (n + 1)).fill(false)
  const stack: number[] = [0] // state (i, j) encoded as i * (n + 1) + j
  while (stack.length > 0) {
    const state = stack.pop() as number
    if (visited[state]) {
      continue
    }
    visited[state] = true
    const i = Math.floor(state / (n + 1))
    const j = state % (n + 1)
    if (i === m && j === n) {
      return true
    }
    if (i < m && s1[i] === s3[i + j]) {
      stack.push((i + 1) * (n + 1) + j)
    }
    if (j < n && s2[j] === s3[i + j]) {
      stack.push(i * (n + 1) + j + 1)
    }
  }
  return false
}
