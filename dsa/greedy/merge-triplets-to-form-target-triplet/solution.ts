function mergeTriplets(triplets: number[][], target: number[]): boolean {
  const merged = [0, 0, 0]
  for (const t of triplets) {
    // A triplet that overshoots any coordinate would poison every merge it joins.
    if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) continue
    for (let k = 0; k < 3; k++) merged[k] = Math.max(merged[k], t[k])
  }
  return merged[0] === target[0] && merged[1] === target[1] && merged[2] === target[2]
}
