class Animal {}
class Dog extends Animal {}

test('true for a direct instance', () => {
  expect(myInstanceof(new Dog(), Dog)).toBe(true)
  function Legacy() {}
  expect(myInstanceof(new Legacy(), Legacy)).toBe(true)
})

test('follows the whole prototype chain', () => {
  const rex = new Dog()
  expect(myInstanceof(rex, Animal)).toBe(true)
  expect(myInstanceof(rex, Object)).toBe(true)
  expect(myInstanceof([], Object)).toBe(true)
})

test('false for unrelated constructors', () => {
  expect(myInstanceof(new Animal(), Dog)).toBe(false)
  expect(myInstanceof({}, Array)).toBe(false)
  expect(myInstanceof(new Dog(), Map)).toBe(false)
})

test('primitives are never instances', () => {
  expect(myInstanceof(5, Number)).toBe(false)
  expect(myInstanceof('s', String)).toBe(false)
  expect(myInstanceof(true, Boolean)).toBe(false)
  expect(myInstanceof(null, Object)).toBe(false)
  expect(myInstanceof(undefined, Object)).toBe(false)
})

test('boxed primitives and functions are objects', () => {
  expect(myInstanceof(new Number(5), Number)).toBe(true)
  expect(myInstanceof(function () {}, Function)).toBe(true)
  expect(myInstanceof(() => {}, Object)).toBe(true)
})

test('objects without a prototype are not instances of Object', () => {
  expect(myInstanceof(Object.create(null), Object)).toBe(false)
})

test('reflects later prototype changes', () => {
  function Box() {}
  const b = new Box()
  Box.prototype = {}
  expect(myInstanceof(b, Box)).toBe(false)
  Object.setPrototypeOf(b, Box.prototype)
  expect(myInstanceof(b, Box)).toBe(true)
})

test('throws a TypeError when the right side is not callable', () => {
  expect(() => myInstanceof({}, {})).toThrow(TypeError)
  expect(() => myInstanceof({}, 42)).toThrow(TypeError)
})

test('does not rely on isPrototypeOf', () => {
  const saved = Object.prototype.isPrototypeOf
  Object.prototype.isPrototypeOf = () => {
    throw new Error('used isPrototypeOf')
  }
  let a, b
  try {
    a = myInstanceof(new Dog(), Animal)
    b = myInstanceof(new Animal(), Dog)
  } finally {
    Object.prototype.isPrototypeOf = saved
  }
  expect(a).toBe(true)
  expect(b).toBe(false)
})
