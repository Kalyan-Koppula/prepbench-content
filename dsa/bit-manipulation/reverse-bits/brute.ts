// Write the 32 bits into an array, lowest first, then read them back as the
// highest bits first: the array order is already the reversed order.
function reverseBits(n: number): number {
  const bits: number[] = []
  let x = n
  for (let i = 0; i < 32; i++) {
    bits.push(x % 2)
    x = Math.floor(x / 2)
  }
  let result = 0
  for (let i = 0; i < 32; i++) {
    result = result * 2 + bits[i]
  }
  return result
}
