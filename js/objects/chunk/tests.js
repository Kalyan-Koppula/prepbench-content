test('splits into chunks of the given size', () => {
  expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]])
})

test('puts the leftover items in a smaller last chunk', () => {
  expect(chunk(['a', 'b', 'c', 'd', 'e'], 2)).toEqual([['a', 'b'], ['c', 'd'], ['e']])
})

test('returns one chunk when size is larger than the array', () => {
  expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]])
})

test('returns an empty array for empty input', () => {
  expect(chunk([], 3)).toEqual([])
})

test('uses size 1 to wrap every item', () => {
  expect(chunk([7, 8, 9], 1)).toEqual([[7], [8], [9]])
})

test('returns new arrays and leaves the input alone', () => {
  const input = [1, 2, 3]
  const result = chunk(input, 3)
  expect(result[0]).not.toBe(input)
  expect(input).toEqual([1, 2, 3])
})

test('keeps item references instead of copying items', () => {
  const a = { id: 1 }
  const b = { id: 2 }
  const [[first], [second]] = chunk([a, b], 1)
  expect(first).toBe(a)
  expect(second).toBe(b)
})

test('throws a RangeError for a size that is not a positive integer', () => {
  expect(() => chunk([1, 2], 0)).toThrow(RangeError)
  expect(() => chunk([1, 2], -2)).toThrow(RangeError)
  expect(() => chunk([1, 2], 1.5)).toThrow(RangeError)
  expect(() => chunk([1, 2], NaN)).toThrow(RangeError)
})
