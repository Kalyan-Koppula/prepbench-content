// Find the longest palindromic prefix by checking prefixes from longest to shortest,
// then put the reverse of the remaining suffix in front. O(n^2).
function shortestPalindrome(s: string): string {
  let k = s.length
  while (k > 0 && !isPalindromePrefix(s, k)) {
    k--
  }
  let front = ''
  for (let i = s.length - 1; i >= k; i--) {
    front += s[i]
  }
  return front + s
}

function isPalindromePrefix(s: string, length: number): boolean {
  let left = 0
  let right = length - 1
  while (left < right) {
    if (s[left] !== s[right]) {
      return false
    }
    left++
    right--
  }
  return true
}
