const sum3 = (a, b, c) => a + b + c

test('takes one argument at a time', () => {
  expect(curry(sum3)(1)(2)(3)).toBe(6)
})

test('takes any grouping of arguments', () => {
  const c = curry(sum3)
  expect(c(1, 2)(3)).toBe(6)
  expect(c(1)(2, 3)).toBe(6)
  expect(c(1, 2, 3)).toBe(6)
})

test('returns functions until enough arguments arrive', () => {
  let calls = 0
  const c = curry((a, b, c) => {
    calls++
    return [a, b, c]
  })
  expect(typeof c(1)).toBe('function')
  expect(typeof c(1)(2)).toBe('function')
  expect(calls).toBe(0)
  expect(c(1)(2)(3)).toEqual([1, 2, 3])
  expect(calls).toBe(1)
})

test('partial applications are independent and reusable', () => {
  const c = curry(sum3)
  const add1 = c(1)
  const add1and2 = add1(2)
  expect(add1(10)(20)).toBe(31)
  expect(add1and2(3)).toBe(6)
  expect(add1and2(100)).toBe(103)
  expect(add1(2)(3)).toBe(6)
})

test('a call with no arguments keeps waiting', () => {
  const c = curry(sum3)
  expect(c(1)()(2)()(3)).toBe(6)
})

test('passes extra arguments through', () => {
  const c = curry(function (a, b) {
    return Array.from(arguments)
  })
  expect(c(1)(2, 3, 4)).toEqual([1, 2, 3, 4])
})

test('uses the declared arity (fn.length)', () => {
  const withDefault = curry((a, b = 10) => a + b)
  expect(withDefault(5)).toBe(15)
  const none = curry(() => 'ran')
  expect(none()).toBe('ran')
})

test('works with arguments that are undefined', () => {
  const c = curry((a, b) => [a, b])
  expect(c(undefined)(undefined)).toEqual([undefined, undefined])
  expect(c(undefined)(undefined)).toHaveLength(2)
})
