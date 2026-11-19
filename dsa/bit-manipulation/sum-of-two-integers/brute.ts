// A ripple-carry adder: add the 32 bits one position at a time, as hardware does.
function getSum(a: number, b: number): number {
  let result = 0
  let carry = 0
  for (let i = 0; i < 32; i++) {
    const bitA = (a >> i) & 1
    const bitB = (b >> i) & 1
    const total = bitA + bitB + carry
    result = result | ((total & 1) << i)
    carry = total >> 1
  }
  return result // 32-bit two's complement, so negative sums come out right
}
