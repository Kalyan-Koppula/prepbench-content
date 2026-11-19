// Try every starting position and compare character by character. O(n * m).
function strStr(haystack: string, needle: string): number {
  for (let i = 0; i + needle.length <= haystack.length; i++) {
    let k = 0
    while (k < needle.length && haystack[i + k] === needle[k]) {
      k++
    }
    if (k === needle.length) {
      return i
    }
  }
  return -1
}
