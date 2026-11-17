const nested = () => [1, [2, [3, [4, [5]]]], 6]

test('flattens one level by default', () => {
  expect(flatten(nested())).toEqual([1, 2, [3, [4, [5]]], 6])
})

test('flattens as many levels as depth says', () => {
  expect(flatten(nested(), 2)).toEqual([1, 2, 3, [4, [5]], 6])
  expect(flatten(nested(), 3)).toEqual([1, 2, 3, 4, [5], 6])
})

test('flattens everything with Infinity', () => {
  expect(flatten(nested(), Infinity)).toEqual([1, 2, 3, 4, 5, 6])
  expect(flatten([[[[[]]]], [[['deep']]]], Infinity)).toEqual(['deep'])
})

test('returns a shallow copy for depth 0 or below', () => {
  const input = [1, [2]]
  const zero = flatten(input, 0)
  expect(zero).toEqual([1, [2]])
  expect(zero).not.toBe(input)
  expect(zero[1]).toBe(input[1])
  expect(flatten(input, -3)).toEqual([1, [2]])
})

test('keeps strings, array-likes and other non-arrays whole', () => {
  const arrayLike = { 0: 'x', length: 1 }
  const set = new Set([1])
  const result = flatten(['ab', [arrayLike, set]], Infinity)
  expect(result).toHaveLength(3)
  expect(result[0]).toBe('ab')
  expect(result[1]).toBe(arrayLike)
  expect(result[2]).toBe(set)
})

test('skips holes but keeps explicit undefined', () => {
  // eslint-disable-next-line no-sparse-arrays
  const sparse = [1, , [2, , undefined], 3]
  const result = flatten(sparse)
  expect(result).toHaveLength(4)
  expect(result).toEqual([1, 2, undefined, 3])
})

test('flattens empty arrays away', () => {
  expect(flatten([[], [1, []], []], 2)).toEqual([1])
  expect(flatten([])).toEqual([])
})

test('does not mutate the input', () => {
  const input = nested()
  flatten(input, Infinity)
  expect(input).toEqual(nested())
})
