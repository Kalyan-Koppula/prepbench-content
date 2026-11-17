test('intersection keeps values found in both arrays, in first-array order', () => {
  expect(intersection([5, 1, 4, 2], [2, 4, 6, 5])).toEqual([5, 4, 2])
})

test('intersection works with any number of arrays', () => {
  expect(intersection(['a', 'b', 'c', 'd'], ['d', 'c', 'b'], ['b', 'd', 'x'], ['d', 'b'])).toEqual(['b', 'd'])
  expect(intersection([1, 2], [2], [])).toEqual([])
})

test('intersection removes duplicates', () => {
  expect(intersection([3, 1, 3, 2, 1], [1, 3, 3])).toEqual([3, 1])
})

test('intersection with one array or none', () => {
  const only = [1, 2, 2, 3]
  const result = intersection(only)
  expect(result).toEqual([1, 2, 3])
  expect(result).not.toBe(only)
  expect(intersection()).toEqual([])
})

test('intersection compares with SameValueZero', () => {
  expect(intersection([NaN, 1, '2'], [2, NaN, '1'])).toEqual([NaN])
  const shared = { id: 1 }
  const result = intersection([shared, { id: 2 }], [{ id: 2 }, shared])
  expect(result).toHaveLength(1)
  expect(result[0]).toBe(shared)
})

test('difference removes values found in any other array and keeps order', () => {
  expect(difference([1, 2, 3, 4, 5], [2], [4, 9])).toEqual([1, 3, 5])
})

test('difference keeps duplicates from the first array', () => {
  expect(difference(['a', 'b', 'a', 'c', 'b'], ['c'])).toEqual(['a', 'b', 'a', 'b'])
})

test('difference with no other arrays returns a copy', () => {
  const input = [1, 2, 3]
  const result = difference(input)
  expect(result).toEqual([1, 2, 3])
  expect(result).not.toBe(input)
})

test('difference compares with SameValueZero', () => {
  expect(difference([NaN, 0, '0', 1], [NaN, -0])).toEqual(['0', 1])
  const keep = { id: 1 }
  expect(difference([keep], [{ id: 1 }])[0]).toBe(keep)
})

test('neither function mutates its inputs', () => {
  const a = [3, 2, 1]
  const b = [1, 2]
  intersection(a, b)
  difference(a, b)
  expect(a).toEqual([3, 2, 1])
  expect(b).toEqual([1, 2])
})
