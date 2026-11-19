function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) {
    return false
  }
  const used = new Array(t.length).fill(false)
  for (let i = 0; i < s.length; i++) {
    // Claim one unused copy of s[i] in t. Each copy of t may be claimed once.
    let found = false
    for (let j = 0; j < t.length; j++) {
      if (!used[j] && t[j] === s[i]) {
        used[j] = true
        found = true
        break
      }
    }
    if (!found) {
      return false
    }
  }
  // Equal lengths and every letter of s matched, so all of t is used too.
  return true
}
