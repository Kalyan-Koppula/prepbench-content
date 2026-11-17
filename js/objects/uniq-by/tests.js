test('keeps the first item for each key from a function', () => {
  expect(uniqBy([2.1, 1.5, 2.9, 1.1, 3.0], Math.floor)).toEqual([2.1, 1.5, 3.0])
})

test('accepts a property name', () => {
  const a1 = { id: 'a', v: 1 }
  const b = { id: 'b', v: 2 }
  const a2 = { id: 'a', v: 3 }
  const result = uniqBy([a1, b, a2], 'id')
  expect(result).toHaveLength(2)
  expect(result[0]).toBe(a1)
  expect(result[1]).toBe(b)
})

test('keeps the order in which keys first appear', () => {
  const words = ['pear', 'apple', 'plum', 'avocado', 'banana']
  expect(uniqBy(words, (w) => w[0])).toEqual(['pear', 'apple', 'banana'])
})

test('does not treat 1 and "1" as the same key', () => {
  const rows = [{ k: 1 }, { k: '1' }, { k: 1 }]
  expect(uniqBy(rows, 'k')).toEqual([{ k: 1 }, { k: '1' }])
})

test('treats NaN keys as equal to each other', () => {
  expect(uniqBy(['x', 'y', '3'], (s) => Number(s))).toEqual(['x', '3'])
})

test('compares object keys by reference', () => {
  const team = { name: 'core' }
  const sameName = { name: 'core' }
  const people = [{ team }, { team: sameName }, { team }]
  const result = uniqBy(people, 'team')
  expect(result).toHaveLength(2)
  expect(result[1].team).toBe(sameName)
})

test('groups missing keys together as undefined', () => {
  const result = uniqBy([{ id: 1 }, { name: 'x' }, { name: 'y' }], 'id')
  expect(result).toEqual([{ id: 1 }, { name: 'x' }])
})

test('calls the key function once per item', () => {
  const key = fn((n) => n % 3)
  uniqBy([1, 2, 3, 4, 5], key)
  expect(key).toHaveBeenCalledTimes(5)
})

test('returns a new array and leaves the input alone', () => {
  const input = [1, 2, 3]
  const result = uniqBy(input, (n) => n)
  expect(result).toEqual([1, 2, 3])
  expect(result).not.toBe(input)
  expect(uniqBy([], 'id')).toEqual([])
})
