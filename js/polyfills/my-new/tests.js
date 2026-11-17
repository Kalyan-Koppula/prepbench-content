function Person(name, age) {
  this.name = name
  this.age = age
}
Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`
}

test('links the new object to the prototype', () => {
  const p = myNew(Person, 'Ada')
  expect(Object.getPrototypeOf(p)).toBe(Person.prototype)
  expect(p instanceof Person).toBe(true)
  expect(p.greet()).toBe("Hi, I'm Ada")
})

test('runs the constructor with the arguments and the new object as `this`', () => {
  const p = myNew(Person, 'Grace', 85)
  expect(p.name).toBe('Grace')
  expect(p.age).toBe(85)
  expect(Object.keys(p)).toEqual(['name', 'age'])
})

test('the prototype is in place while the constructor runs', () => {
  function Widget() {
    this.init()
  }
  Widget.prototype.init = function () {
    this.ready = true
  }
  expect(myNew(Widget).ready).toBe(true)
})

test('an object returned by the constructor wins', () => {
  const custom = { custom: true }
  function Factory() {
    this.lost = true
    return custom
  }
  expect(myNew(Factory)).toBe(custom)
  const f = function () {}
  function ReturnsFn() {
    return f
  }
  expect(myNew(ReturnsFn)).toBe(f)
})

test('primitive and null return values are ignored', () => {
  function R(value) {
    this.kept = true
    return value
  }
  for (const v of [42, 'str', null, undefined, false]) {
    const obj = myNew(R, v)
    expect(obj.kept).toBe(true)
    expect(obj instanceof R).toBe(true)
  }
})

test('falls back to Object.prototype when prototype is not an object', () => {
  function Bare() {
    this.x = 1
  }
  Bare.prototype = null
  const obj = myNew(Bare)
  expect(Object.getPrototypeOf(obj)).toBe(Object.prototype)
  expect(obj.x).toBe(1)
})

test('creates a distinct object each time', () => {
  const a = myNew(Person, 'A')
  const b = myNew(Person, 'B')
  expect(a).not.toBe(b)
  expect(a.name).toBe('A')
  expect(b.name).toBe('B')
})

test('throws a TypeError for non-functions', () => {
  expect(() => myNew({})).toThrow(TypeError)
  expect(() => myNew(null)).toThrow(TypeError)
})

test('does not rely on Reflect.construct', () => {
  const saved = Reflect.construct
  Reflect.construct = () => {
    throw new Error('used Reflect.construct')
  }
  let p
  try {
    p = myNew(Person, 'Linus')
  } finally {
    Reflect.construct = saved
  }
  expect(p.greet()).toBe("Hi, I'm Linus")
})
