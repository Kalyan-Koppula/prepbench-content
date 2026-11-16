// Independent method (Hunt-Szymanski idea): list every matching pair (i, j) ordered by i,
// with j descending inside each i; a strictly increasing run of j values is a common subsequence.
function longestCommonSubsequence(text1: string, text2: string): number {
  const positions = new Map<string, number[]>()
  for (let j = text2.length - 1; j >= 0; j--) {
    if (!positions.has(text2[j])) positions.set(text2[j], [])
    positions.get(text2[j])!.push(j)
  }
  const seq: number[] = []
  for (const ch of text1) for (const j of positions.get(ch) ?? []) seq.push(j)
  // Strict LIS of that sequence, using a tails array with a linear scan.
  const tails: number[] = []
  for (const x of seq) {
    let k = 0
    while (k < tails.length && tails[k] < x) k++
    tails[k] = x
  }
  return tails.length
}
