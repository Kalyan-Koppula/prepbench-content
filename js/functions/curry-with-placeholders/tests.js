const _ = curry.placeholder
const list3 = (a, b, c) => [a, b, c]

test('works like plain curry without placeholders', () => {
  const c = curry(list3)
  expect(c(1)(2)(3)).toEqual([1, 2, 3])
  expect(c(1, 2)(3)).toEqual([1, 2, 3])
  expect(c(1, 2, 3)).toEqual([1, 2, 3])
})

test('a placeholder skips a position until a later call fills it', () => {
  const c = curry(list3)
  expect(c(_, 2)(1)(3)).toEqual([1, 2, 3])
  expect(c(_, 2)(1, 3)).toEqual([1, 2, 3])
})

test('holes are filled left to right', () => {
  const c = curry(list3)
  expect(c(_, _, 3)(1)(2)).toEqual([1, 2, 3])
  expect(c(_, _, 3)(1, 2)).toEqual([1, 2, 3])
})

test('a placeholder in a later call keeps the hole open', () => {
  const c = curry(list3)
  expect(c(_, 2)(_, 3)(1)).toEqual([1, 2, 3])
  expect(c(_, _, _)(_, 2)(_, 3)(1)).toEqual([1, 2, 3])
})

test('does not run while a hole remains in the first fn.length slots', () => {
  let calls = 0
  const c = curry((a, b, c) => {
    calls++
    return a + b + c
  })
  const waiting = c(1, _, 3)
  expect(typeof waiting).toBe('function')
  expect(calls).toBe(0)
  expect(waiting(2)).toBe(6)
  expect(calls).toBe(1)
})

test('partial applications are independent and reusable', () => {
  const c = curry(list3)
  const mid = c(_, 'm')
  expect(mid('a')('z')).toEqual(['a', 'm', 'z'])
  expect(mid('b', 'y')).toEqual(['b', 'm', 'y'])
  const midA = mid('a')
  expect(midA(1)).toEqual(['a', 'm', 1])
  expect(midA(2)).toEqual(['a', 'm', 2])
})

test('undefined counts as a real argument', () => {
  const c = curry(list3)
  expect(c(undefined)(_, 3)(2)).toEqual([undefined, 2, 3])
})

test('passes extra arguments through', () => {
  const c = curry(function (a, b) {
    return Array.from(arguments)
  })
  expect(c(_, 2)(1, 3, 4)).toEqual([1, 2, 3, 4])
})
