function majorityElement(nums: number[]): number[] {
  let cand1 = 0, count1 = 0
  let cand2 = 1, count2 = 0
  for (const x of nums) {
    if (x === cand1) count1++
    else if (x === cand2) count2++
    else if (count1 === 0) { cand1 = x; count1 = 1 }
    else if (count2 === 0) { cand2 = x; count2 = 1 }
    else { count1--; count2-- }
  }

  // Candidates are only possibilities; confirm with real counts.
  const threshold = Math.floor(nums.length / 3)
  const result: number[] = []
  for (const cand of [cand1, cand2]) {
    let c = 0
    for (const x of nums) if (x === cand) c++
    if (c > threshold) result.push(cand)
  }
  return result
}
