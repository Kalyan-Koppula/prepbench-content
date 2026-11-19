function isPalindrome(s: string, from: number, to: number): boolean {
  while (from < to) {
    if (s[from] !== s[to]) {
      return false
    }
    from++
    to--
  }
  return true
}

function partition(s: string): string[][] {
  // Try every set of cut positions (each of the n - 1 gaps is cut or not),
  // and keep the partitions where every piece is a palindrome.
  const n = s.length
  const result: string[][] = []
  const cut = new Array(n).fill(false) // cut[g]: cut after index g

  function explore(gap: number): void {
    if (gap === n - 1) {
      const pieces: string[] = []
      let from = 0
      for (let i = 0; i < n; i++) {
        if (i === n - 1 || cut[i]) {
          if (!isPalindrome(s, from, i)) {
            return
          }
          pieces.push(s.substring(from, i + 1))
          from = i + 1
        }
      }
      result.push(pieces)
      return
    }
    cut[gap] = false
    explore(gap + 1)
    cut[gap] = true
    explore(gap + 1)
    cut[gap] = false
  }

  explore(0)
  return result
}
