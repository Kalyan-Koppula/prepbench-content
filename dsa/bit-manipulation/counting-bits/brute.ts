function countBits(n: number): number[] {
  const out: number[] = []
  for (let i = 0; i <= n; i++) out.push(i.toString(2).split('1').length - 1)
  return out
}
