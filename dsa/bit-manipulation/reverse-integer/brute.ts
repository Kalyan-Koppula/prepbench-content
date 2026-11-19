// Reverse the digits in a wider type (a 64-bit integer in Java or C++;
// here a double, exact for these sizes), then check the 32-bit range once.
function reverse(x: number): number {
  const negative = x < 0
  let rest = negative ? -x : x
  let reversed = 0
  while (rest > 0) {
    reversed = reversed * 10 + (rest % 10)
    rest = Math.floor(rest / 10)
  }
  if (negative) {
    reversed = -reversed
  }
  if (reversed > 2147483647 || reversed < -2147483648) {
    return 0
  }
  return reversed
}
