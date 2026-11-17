beforeEach(() => {
  Object.defineProperty(Function.prototype, 'myApply', { value: myApply, configurable: true, writable: true })
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

function collect() {
  return [this, Array.from(arguments)]
}

test('runs with the given `this` and spreads the array', () => {
  const ctx = { id: 1 }
  const [self, args] = collect.myApply(ctx, ['a', 'b'])
  expect(self).toBe(ctx)
  expect(args).toEqual(['a', 'b'])
})

test('null or undefined argsArray means no arguments', () => {
  expect(collect.myApply({}, null)[1]).toEqual([])
  expect(collect.myApply({}, undefined)[1]).toEqual([])
  expect(collect.myApply({})[1]).toEqual([])
})

test('accepts array-likes and turns holes into undefined', () => {
  expect(collect.myApply(null, { length: 3, 0: 'x', 2: 'z' })[1]).toEqual(['x', undefined, 'z'])
  expect(collect.myApply(null, { length: 3, 0: 'x', 2: 'z' })[1]).toHaveLength(3)
  expect(collect.myApply(null, [1, , 3])[1]).toHaveLength(3)
})

test('throws a TypeError for non-object argsArray', () => {
  expect(() => collect.myApply(null, 42)).toThrow(TypeError)
  expect(() => collect.myApply(null, 'ab')).toThrow(TypeError)
  expect(() => collect.myApply(null, true)).toThrow(TypeError)
})

test('handles null `this` and primitive `this`', () => {
  expect(collect.myApply(null, [])[0]).toBe(window)
  function shout(mark) {
    return this.toUpperCase() + mark
  }
  expect(shout.myApply('hey', ['!'])).toBe('HEY!')
})

test('does not modify the arguments array or the context', () => {
  const args = [1, 2]
  const ctx = { a: 1 }
  collect.myApply(ctx, args)
  expect(args).toEqual([1, 2])
  expect(Object.getOwnPropertyNames(ctx)).toEqual(['a'])
  expect(Object.getOwnPropertySymbols(ctx)).toHaveLength(0)
})

test('propagates errors and still cleans up', () => {
  const ctx = {}
  function fail(msg) {
    throw new Error(msg)
  }
  expect(() => fail.myApply(ctx, ['bad input'])).toThrow('bad input')
  expect(Object.getOwnPropertySymbols(ctx)).toHaveLength(0)
  expect(Object.getOwnPropertyNames(ctx)).toHaveLength(0)
})

test('does not rely on call, apply, bind or Reflect.apply', () => {
  function sum(a, b) {
    return this.k + a + b
  }
  const result = without(Reflect, ['apply'], () =>
    without(Function.prototype, ['call', 'apply', 'bind'], () => sum.myApply({ k: 1 }, [2, 3])),
  )
  expect(result).toBe(6)
})
