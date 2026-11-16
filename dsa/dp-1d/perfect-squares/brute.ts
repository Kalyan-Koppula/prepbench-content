// Number theory cross-check (Lagrange / Legendre): the answer is 1, 2, 3 or 4.
function numSquares(n: number): number {
  const isSquare = (x: number) => Number.isInteger(Math.sqrt(x))
  if (isSquare(n)) return 1
  for (let a = 1; a * a <= n; a++) if (isSquare(n - a * a)) return 2
  let m = n
  while (m % 4 === 0) m /= 4
  return m % 8 === 7 ? 4 : 3
}
