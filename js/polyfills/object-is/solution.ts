function objectIs(a: unknown, b: unknown): boolean {
  if (a === b) {
    // Only +0 and -0 are === yet different: 1/+0 is Infinity, 1/-0 is -Infinity.
    return a !== 0 || 1 / (a as number) === 1 / (b as number)
  }
  // Only NaN is not equal to itself.
  return a !== a && b !== b
}
