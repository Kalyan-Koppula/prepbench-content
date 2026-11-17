test('caches results by the first argument', () => {
  const spy = fn((n) => n * 2)
  const m = memoize(spy)
  expect(m(2)).toBe(4)
  expect(m(2)).toBe(4)
  expect(m(3)).toBe(6)
  expect(spy).toHaveBeenCalledTimes(2)
})

test('extra arguments are passed on but do not change the default key', () => {
  const spy = fn((a, b) => `${a}-${b}`)
  const m = memoize(spy)
  expect(m(1, 'x')).toBe('1-x')
  expect(m(1, 'y')).toBe('1-x')
  expect(spy).toHaveBeenCalledTimes(1)
  expect(spy).toHaveBeenCalledWith(1, 'x')
})

test('caches undefined results', () => {
  const spy = fn()
  const m = memoize(spy)
  m('k')
  m('k')
  expect(spy).toHaveBeenCalledTimes(1)
})

test('object keys are compared by identity', () => {
  const spy = fn((o) => o.v)
  const m = memoize(spy)
  const a = { v: 1 }
  m(a)
  m({ v: 1 })
  m(a)
  expect(spy).toHaveBeenCalledTimes(2)
})

test('uses the resolver with all arguments and `this` to build the key', () => {
  const spy = fn((a, b) => a + b)
  const resolver = fn(function (a, b) {
    return `${this.prefix}:${a}:${b}`
  })
  const obj = { prefix: 'p', add: memoize(spy, resolver) }
  expect(obj.add(1, 2)).toBe(3)
  expect(obj.add(1, 3)).toBe(4)
  expect(obj.add(1, 2)).toBe(3)
  expect(spy).toHaveBeenCalledTimes(2)
  expect(resolver.mock.contexts[0]).toBe(obj)
  expect(obj.add.cache.has('p:1:3')).toBe(true)
})

test('forwards `this` to fn', () => {
  const spy = fn(function (n) {
    return this.base + n
  })
  const obj = { base: 10, calc: memoize(spy) }
  expect(obj.calc(5)).toBe(15)
  expect(spy.mock.contexts[0]).toBe(obj)
})

test('exposes the cache as a Map', () => {
  const m = memoize((n) => n * n)
  m(3)
  expect(m.cache).toBeInstanceOf(Map)
  expect(m.cache.get(3)).toBe(9)
  expect(m.cache.size).toBe(1)
})

test('respects entries set or deleted from outside', () => {
  const spy = fn((n) => n * n)
  const m = memoize(spy)
  m.cache.set(4, 'seeded')
  expect(m(4)).toBe('seeded')
  expect(spy).not.toHaveBeenCalled()
  m(5)
  m.cache.delete(5)
  m(5)
  m.cache.clear()
  m(4)
  expect(spy.mock.calls).toEqual([[5], [5], [4]])
})

test('does not cache when fn throws', () => {
  const spy = fn()
  spy.mockImplementationOnce(() => {
    throw new Error('flaky')
  })
  spy.mockReturnValue('ok')
  const m = memoize(spy)
  expect(() => m(1)).toThrow('flaky')
  expect(m.cache.has(1)).toBe(false)
  expect(m(1)).toBe('ok')
  expect(m(1)).toBe('ok')
  expect(spy).toHaveBeenCalledTimes(2)
})
