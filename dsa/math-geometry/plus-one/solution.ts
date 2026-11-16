function plusOne(digits: number[]): number[] {
  const out = [...digits]
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i] < 9) {
      out[i]++
      return out // no carry left to propagate
    }
    out[i] = 0
  }
  // Every digit was 9: 99...9 + 1 = 100...0
  return [1, ...out]
}
