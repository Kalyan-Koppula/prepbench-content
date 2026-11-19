// Cut at the first position where no letter of the current piece appears
// in the rest of the string, checking the rest directly. O(n^2).
function partitionLabels(s: string): number[] {
  const sizes: number[] = []
  let start = 0
  while (start < s.length) {
    const inPiece = new Array(26).fill(false)
    let end = start
    while (end < s.length) {
      inPiece[s.charCodeAt(end) - 97] = true
      let sharesLetter = false
      for (let k = end + 1; k < s.length; k++) {
        if (inPiece[s.charCodeAt(k) - 97]) {
          sharesLetter = true
          break
        }
      }
      if (!sharesLetter) {
        break
      }
      end++
    }
    sizes.push(end - start + 1)
    start = end + 1
  }
  return sizes
}
