function reverseBits(n: number): number {
  const bits = n.toString(2).padStart(32, '0')
  return parseInt(bits.split('').reverse().join(''), 2)
}
