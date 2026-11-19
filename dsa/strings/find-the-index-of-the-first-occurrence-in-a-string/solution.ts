function strStr(haystack: string, needle: string): number {
  const m = needle.length
  // lps[i] = length of the longest proper prefix of needle[0..i]
  // that is also a suffix of it (the KMP "failure function").
  const lps = new Array(m).fill(0)
  let length = 0
  for (let i = 1; i < m; i++) {
    while (length > 0 && needle[i] !== needle[length]) {
      length = lps[length - 1] // fall back to a shorter border
    }
    if (needle[i] === needle[length]) {
      length++
    }
    lps[i] = length
  }

  let j = 0 // characters of needle matched so far
  for (let i = 0; i < haystack.length; i++) {
    while (j > 0 && haystack[i] !== needle[j]) {
      j = lps[j - 1] // keep the part of the match that can still be used
    }
    if (haystack[i] === needle[j]) {
      j++
    }
    if (j === m) {
      return i - m + 1
    }
  }
  return -1
}
