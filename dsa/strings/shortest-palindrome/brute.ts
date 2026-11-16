function shortestPalindrome(s: string): string {
  const isPal = (end: number) => {
    for (let l = 0, r = end - 1; l < r; l++, r--) if (s[l] !== s[r]) return false
    return true
  }
  let k = s.length
  while (k > 0 && !isPal(k)) k--
  return s.slice(k).split('').reverse().join('') + s
}
