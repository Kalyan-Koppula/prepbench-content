// Horizontal scan: shrink the prefix to what it shares with each string in turn.
function longestCommonPrefix(strs: string[]): string {
  let prefixLength = strs[0].length
  for (let k = 1; k < strs.length; k++) {
    let shared = 0
    while (shared < prefixLength && shared < strs[k].length && strs[k][shared] === strs[0][shared]) {
      shared++
    }
    prefixLength = shared
  }
  return strs[0].substring(0, prefixLength)
}
