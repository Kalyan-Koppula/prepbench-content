function numDecodings(s: string): number {
  // oneBack = ways(prefix of length i - 1), twoBack = ways(length i - 2).
  let twoBack = 1 // empty prefix
  let oneBack = s[0] === '0' ? 0 : 1
  for (let i = 2; i <= s.length; i++) {
    let cur = 0
    if (s[i - 1] !== '0') cur += oneBack // last letter is one digit
    const pair = Number(s.slice(i - 2, i))
    if (pair >= 10 && pair <= 26) cur += twoBack // last letter is two digits
    twoBack = oneBack
    oneBack = cur
  }
  return oneBack
}
