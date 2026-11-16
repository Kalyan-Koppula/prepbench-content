function checkInclusion(s1: string, s2: string): boolean {
  const key = (s: string) => s.split('').sort().join('')
  const target = key(s1)
  for (let i = 0; i + s1.length <= s2.length; i++) {
    if (key(s2.slice(i, i + s1.length)) === target) return true
  }
  return false
}
