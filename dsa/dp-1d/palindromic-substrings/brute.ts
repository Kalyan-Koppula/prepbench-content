function countSubstrings(s: string): number {
  let count = 0
  for (let i = 0; i < s.length; i++)
    for (let j = i; j < s.length; j++) {
      const sub = s.slice(i, j + 1)
      if (sub === sub.split('').reverse().join('')) count++
    }
  return count
}
