function mergeTriplets(triplets: number[][], target: number[]): boolean {
  const merged = [0, 0, 0]
  for (let i = 0; i < triplets.length; i++) {
    const t = triplets[i]
    // A triplet larger than the target anywhere would ruin every merge it joins.
    if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2]) {
      continue
    }
    for (let k = 0; k < 3; k++) {
      if (t[k] > merged[k]) {
        merged[k] = t[k]
      }
    }
  }
  return merged[0] === target[0] && merged[1] === target[1] && merged[2] === target[2]
}
