test('evaluates single numbers', () => {
  expect(evaluate('42')).toBe(42)
  expect(evaluate('3.75')).toBe(3.75)
  expect(evaluate('.5')).toBe(0.5)
})

test('applies + and - left to right', () => {
  expect(evaluate('10 - 4 - 3')).toBe(3)
  expect(evaluate('1 + 2 - 3 + 4')).toBe(4)
})

test('gives * and / higher precedence, left-associative', () => {
  expect(evaluate('2 + 3 * 4')).toBe(14)
  expect(evaluate('20 - 10 / 5')).toBe(18)
  expect(evaluate('8 / 4 / 2')).toBe(1)
  expect(evaluate('2 * 6 / 3 * 2')).toBe(8)
})

test('respects nested parentheses', () => {
  expect(evaluate('(2 + 3) * 4')).toBe(20)
  expect(evaluate('((1 + 2) * (3 + 4)) / 7')).toBe(3)
  expect(evaluate('2 * (3 + (4 - 1)) * 2')).toBe(24)
  expect(evaluate('(((9)))')).toBe(9)
})

test('handles unary minus and plus', () => {
  expect(evaluate('-3 + 5')).toBe(2)
  expect(evaluate('2 * -3')).toBe(-6)
  expect(evaluate('-(2 + 3)')).toBe(-5)
  expect(evaluate('--4')).toBe(4)
  expect(evaluate('3 - -2')).toBe(5)
  expect(evaluate('+5 - +2')).toBe(3)
})

test('allows any whitespace, or none', () => {
  expect(evaluate(' 1+2 *3 ')).toBe(7)
  expect(evaluate('\t4\n/ 2')).toBe(2)
})

test('works with decimals and fractional results', () => {
  expect(evaluate('7 / 2')).toBe(3.5)
  expect(evaluate('.5 * 4')).toBe(2)
  expect(evaluate('0.1 + 0.2')).toBeCloseTo(0.3, 10)
})

test('divides by zero like JavaScript', () => {
  expect(evaluate('1 / 0')).toBe(Infinity)
  expect(evaluate('-1 / (2 - 2)')).toBe(-Infinity)
})

test('reads leading zeros as decimal', () => {
  expect(evaluate('010 + 1')).toBe(11)
})

test('throws SyntaxError for malformed input', () => {
  for (const bad of ['', '   ', '2 +', '* 3', '(1 + 2', '1 + 2)', '()', '1 2', '1.2.3', '4 % 2', 'abc']) {
    expect(() => evaluate(bad)).toThrow(SyntaxError)
  }
})

test('rejects JavaScript-only syntax', () => {
  for (const bad of ['2 ** 3', '0x10', '1e3', '1, 2', 'Math.PI']) {
    expect(() => evaluate(bad)).toThrow(SyntaxError)
  }
})
