function numDecodings(s: string): number {
  // ways(i) = number of readings of the first i characters.
  let twoBack = 1 // ways(0): the empty prefix has one reading
  let oneBack = s[0] === '0' ? 0 : 1 // ways(1)
  for (let i = 2; i <= s.length; i++) {
    let current = 0
    // The last letter used one digit (1..9).
    if (s[i - 1] !== '0') {
      current += oneBack
    }
    // The last letter used two digits (10..26).
    const pair = (s.charCodeAt(i - 2) - 48) * 10 + (s.charCodeAt(i - 1) - 48)
    if (pair >= 10 && pair <= 26) {
      current += twoBack
    }
    twoBack = oneBack
    oneBack = current
  }
  return oneBack
}
