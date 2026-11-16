function isHappy(n: number): boolean {
  // Any start falls below 1000 within a couple of steps and the cycle is short,
  // so a generous fixed step budget is enough.
  for (let step = 0; step < 1000; step++) {
    if (n === 1) return true
    n = String(n)
      .split('')
      .reduce((s, ch) => s + Number(ch) ** 2, 0)
  }
  return false
}
