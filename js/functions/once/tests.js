test('calls fn only on the first call', () => {
  const spy = fn()
  const o = once(spy)
  o()
  o()
  o()
  expect(spy).toHaveBeenCalledTimes(1)
})

test('returns the first result on every call', () => {
  const o = once((x) => ({ value: x }))
  const first = o(1)
  expect(first).toEqual({ value: 1 })
  expect(o(2)).toBe(first)
})

test('remembers falsy results too', () => {
  const spy = fn(() => 0)
  const o = once(spy)
  expect(o()).toBe(0)
  expect(o()).toBe(0)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('forwards `this` and all arguments of the first call', () => {
  const spy = fn(function (a, b, c) {
    return [this.id, a, b, c]
  })
  const obj = { id: 7, run: once(spy) }
  expect(obj.run('a', 'b', 'c')).toEqual([7, 'a', 'b', 'c'])
  expect(spy.mock.contexts[0]).toBe(obj)
})

test('a throwing first run does not count', () => {
  const spy = fn()
  spy.mockImplementationOnce(() => {
    throw new Error('boom')
  })
  spy.mockReturnValue('ok')
  const o = once(spy)
  expect(() => o()).toThrow('boom')
  expect(o()).toBe('ok')
  expect(o()).toBe('ok')
  expect(spy).toHaveBeenCalledTimes(2)
})

test('a call from inside fn does not run fn again', () => {
  let o
  const spy = fn(() => {
    o()
    return 'done'
  })
  o = once(spy)
  expect(o()).toBe('done')
  expect(spy).toHaveBeenCalledTimes(1)
})

test('each wrapper has its own state', () => {
  const spy = fn((x) => x)
  const a = once(spy)
  const b = once(spy)
  expect(a(1)).toBe(1)
  expect(b(2)).toBe(2)
  expect(spy).toHaveBeenCalledTimes(2)
})
