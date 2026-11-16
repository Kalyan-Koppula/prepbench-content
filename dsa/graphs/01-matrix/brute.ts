function updateMatrix(mat: number[][]): number[][] {
  // With no obstacles, grid distance is Manhattan distance.
  const zeros: number[][] = []
  mat.forEach((row, r) => row.forEach((v, c) => v === 0 && zeros.push([r, c])))
  return mat.map((row, r) =>
    row.map((_, c) => Math.min(...zeros.map(([zr, zc]) => Math.abs(zr - r) + Math.abs(zc - c)))),
  )
}
