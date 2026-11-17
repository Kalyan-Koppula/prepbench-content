test('waits for the delay before calling', () => {
  const spy = fn()
  const debounced = debounce(spy, 100)
  debounced()
  clock.tick(99)
  expect(spy).not.toHaveBeenCalled()
  clock.tick(1)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('restarts the timer on every call', () => {
  const spy = fn()
  const debounced = debounce(spy, 100)
  debounced()
  clock.tick(60)
  debounced()
  clock.tick(60)
  expect(spy).not.toHaveBeenCalled()
  clock.tick(40)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('uses the arguments of the last call', () => {
  const spy = fn()
  const debounced = debounce(spy, 50)
  debounced('a')
  debounced('b', 2)
  clock.tick(50)
  expect(spy).toHaveBeenCalledWith('b', 2)
})

test('keeps `this` from the call site', () => {
  const spy = fn(function () {
    return this.name
  })
  const obj = { name: 'obj', save: debounce(spy, 10) }
  obj.save()
  clock.tick(10)
  expect(spy.mock.contexts[0]).toBe(obj)
})

test('calls again for a later burst', () => {
  const spy = fn()
  const debounced = debounce(spy, 20)
  debounced(1)
  clock.tick(20)
  debounced(2)
  clock.tick(20)
  expect(spy.mock.calls).toEqual([[1], [2]])
})

test('wait of 0 still runs asynchronously', () => {
  const spy = fn()
  const debounced = debounce(spy, 0)
  debounced()
  expect(spy).not.toHaveBeenCalled()
  clock.tick(0)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('cancel drops the pending call', () => {
  const spy = fn()
  const debounced = debounce(spy, 30)
  debounced()
  debounced.cancel()
  clock.tick(100)
  expect(spy).not.toHaveBeenCalled()
  debounced()
  clock.tick(30)
  expect(spy).toHaveBeenCalledTimes(1)
})
