function strStr(haystack: string, needle: string): number {
  const m = needle.length
  // lps[i]: longest proper prefix of needle[0..i] that is also its suffix
  const lps = new Array<number>(m).fill(0)
  for (let i = 1, len = 0; i < m; i++) {
    while (len > 0 && needle[i] !== needle[len]) len = lps[len - 1]
    if (needle[i] === needle[len]) len++
    lps[i] = len
  }

  for (let i = 0, j = 0; i < haystack.length; i++) {
    while (j > 0 && haystack[i] !== needle[j]) j = lps[j - 1] // reuse the matched prefix
    if (haystack[i] === needle[j]) j++
    if (j === m) return i - m + 1
  }
  return -1
}
