function groupAnagrams(strs: string[]): string[][] {
  const sorted = (w: string) => w.split('').sort().join('')
  const groups: string[][] = []
  for (const word of strs) {
    const g = groups.find((grp) => sorted(grp[0]) === sorted(word))
    if (g) g.push(word)
    else groups.push([word])
  }
  return groups
}
