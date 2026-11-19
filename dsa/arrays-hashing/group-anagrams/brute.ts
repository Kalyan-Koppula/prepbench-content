function sameLetters(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  const count = new Array(26).fill(0)
  for (let i = 0; i < a.length; i++) {
    count[a.charCodeAt(i) - 97]++
    count[b.charCodeAt(i) - 97]--
  }
  for (let c = 0; c < 26; c++) {
    if (count[c] !== 0) {
      return false
    }
  }
  return true
}

function groupAnagrams(strs: string[]): string[][] {
  const assigned = new Array(strs.length).fill(false)
  const result: string[][] = []
  for (let i = 0; i < strs.length; i++) {
    if (assigned[i]) {
      continue
    }
    // strs[i] is the first word of a new group: pull in every later match.
    const group: string[] = [strs[i]]
    assigned[i] = true
    for (let j = i + 1; j < strs.length; j++) {
      if (!assigned[j] && sameLetters(strs[i], strs[j])) {
        group.push(strs[j])
        assigned[j] = true
      }
    }
    result.push(group)
  }
  return result
}
