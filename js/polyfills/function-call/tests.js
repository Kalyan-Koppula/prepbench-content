beforeEach(() => {
  Object.defineProperty(Function.prototype, 'myCall', { value: myCall, configurable: true, writable: true })
})

function without(owner, names, run) {
  const saved = names.map((n) => Object.getOwnPropertyDescriptor(owner, n))
  for (const n of names)
    Object.defineProperty(owner, n, { value: () => { throw new Error(`used the built-in ${n}`) }, configurable: true, writable: true })
  try {
    return run()
  } finally {
    names.forEach((n, i) => Object.defineProperty(owner, n, saved[i]))
  }
}

test('runs the function with the given `this`', () => {
  const ctx = { name: 'Ada' }
  function getName() {
    return this.name
  }
  expect(getName.myCall(ctx)).toBe('Ada')
})

test('forwards arguments and returns the result', () => {
  const ctx = { base: 10 }
  function sum(a, b, c) {
    return this.base + a + b + c
  }
  expect(sum.myCall(ctx, 1, 2, 3)).toBe(16)
})

test('null or undefined `this` becomes globalThis', () => {
  function self() {
    return this
  }
  expect(self.myCall(null)).toBe(window)
  expect(self.myCall(undefined)).toBe(window)
})

test('boxes primitive `this` values', () => {
  function upper() {
    return this.toUpperCase()
  }
  function plusOne() {
    return this + 1
  }
  expect(upper.myCall('ab')).toBe('AB')
  expect(plusOne.myCall(41)).toBe(42)
})

test('leaves the context untouched', () => {
  const ctx = { fn: 'mine', a: 1 }
  function noop() {}
  noop.myCall(ctx)
  expect(Object.keys(ctx)).toEqual(['fn', 'a'])
  expect(Object.getOwnPropertySymbols(ctx)).toHaveLength(0)
  expect(ctx.fn).toBe('mine')
})

test('the function sees no extra keys on `this`', () => {
  function keys() {
    return Object.keys(this)
  }
  expect(keys.myCall({ a: 1, b: 2 })).toEqual(['a', 'b'])
})

test('propagates errors and still cleans up', () => {
  const ctx = { a: 1 }
  function boom() {
    throw new RangeError('nope')
  }
  expect(() => boom.myCall(ctx)).toThrow(RangeError)
  expect(Object.getOwnPropertyNames(ctx)).toEqual(['a'])
  expect(Object.getOwnPropertySymbols(ctx)).toHaveLength(0)
})

test('does not rely on call, apply, bind or Reflect.apply', () => {
  function pair(x) {
    return [this.id, x]
  }
  const result = without(Reflect, ['apply'], () =>
    without(Function.prototype, ['call', 'apply', 'bind'], () => pair.myCall({ id: 'ctx' }, 'arg')),
  )
  expect(result).toEqual(['ctx', 'arg'])
})
