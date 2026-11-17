test('returns stored values and undefined for missing keys', () => {
  const cache = new LRUCache(3)
  cache.put('a', 1)
  cache.put('b', 2)
  expect(cache.get('a')).toBe(1)
  expect(cache.get('b')).toBe(2)
  expect(cache.get('zzz')).toBeUndefined()
  expect(cache.size).toBe(2)
})

test('evicts the least recently put key when full', () => {
  const cache = new LRUCache(2)
  cache.put('a', 1)
  cache.put('b', 2)
  cache.put('c', 3)
  expect(cache.get('a')).toBeUndefined()
  expect(cache.get('b')).toBe(2)
  expect(cache.get('c')).toBe(3)
  expect(cache.size).toBe(2)
})

test('a get makes the key most recently used', () => {
  const cache = new LRUCache(2)
  cache.put('a', 1)
  cache.put('b', 2)
  cache.get('a')
  cache.put('c', 3)
  expect(cache.get('b')).toBeUndefined()
  expect(cache.get('a')).toBe(1)
})

test('updating a key changes its value, refreshes it and evicts nothing', () => {
  const cache = new LRUCache(2)
  cache.put('a', 1)
  cache.put('b', 2)
  cache.put('a', 10)
  expect(cache.size).toBe(2)
  expect(cache.get('b')).toBe(2)
  cache.put('c', 3)
  expect(cache.get('a')).toBeUndefined()
  expect(cache.get('b')).toBe(2)
  expect(cache.get('c')).toBe(3)
})

test('a miss does not change the eviction order', () => {
  const cache = new LRUCache(2)
  cache.put('a', 1)
  cache.put('b', 2)
  cache.get('missing')
  cache.put('c', 3)
  expect(cache.get('a')).toBeUndefined()
  expect(cache.size).toBe(2)
})

test('works with a capacity of 1', () => {
  const cache = new LRUCache(1)
  cache.put('x', 1)
  cache.put('y', 2)
  expect(cache.get('x')).toBeUndefined()
  expect(cache.get('y')).toBe(2)
  expect(cache.size).toBe(1)
})

test('treats keys like a Map does', () => {
  const cache = new LRUCache(5)
  const objKey = { id: 1 }
  cache.put(1, 'number')
  cache.put('1', 'string')
  cache.put(objKey, 'object')
  expect(cache.get(1)).toBe('number')
  expect(cache.get('1')).toBe('string')
  expect(cache.get(objKey)).toBe('object')
  expect(cache.get({ id: 1 })).toBeUndefined()
})

test('caches falsy values', () => {
  const cache = new LRUCache(2)
  cache.put('zero', 0)
  cache.put('empty', '')
  cache.get('zero')
  cache.put('new', 1)
  expect(cache.get('zero')).toBe(0)
  expect(cache.get('empty')).toBeUndefined()
})

test('rejects a capacity that is not a positive integer', () => {
  expect(() => new LRUCache(0)).toThrow(RangeError)
  expect(() => new LRUCache(-1)).toThrow(RangeError)
  expect(() => new LRUCache(2.5)).toThrow(RangeError)
})

test('stays fast on a large cache (O(1) get and put)', () => {
  const started = Date.now()
  const cache = new LRUCache(30000)
  for (let i = 0; i < 60000; i++) cache.put(i, i)
  let hits = 0
  for (let i = 59999; i >= 0; i--) if (cache.get(i) !== undefined) hits++
  expect(hits).toBe(30000)
  expect(cache.size).toBe(30000)
  // A Map-based cache needs a few milliseconds; scanning an array of keys takes seconds.
  expect(Date.now() - started).toBeLessThan(1000)
})
