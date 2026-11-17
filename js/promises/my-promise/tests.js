const setTimeout = window.setTimeout // timers on the fake clock
const later = (ms, value) => new MyPromise((resolve) => setTimeout(resolve, ms, value))

test('runs the executor synchronously', () => {
  const log = []
  new MyPromise(() => log.push('executor'))
  log.push('after')
  expect(log).toEqual(['executor', 'after'])
})

test('runs then callbacks after the current synchronous code', async () => {
  const log = []
  const p = new MyPromise((resolve) => resolve('value'))
  p.then((v) => log.push('then ' + v))
  log.push('sync')
  expect(log).toEqual(['sync'])
  await clock.flush()
  expect(log).toEqual(['sync', 'then value'])
})

test('schedules callbacks as microtasks, ahead of a zero timeout', async () => {
  const log = []
  setTimeout(() => log.push('timeout'), 0)
  MyPromise.resolve(1).then(() => log.push('then'))
  log.push('sync')
  await clock.runAllAsync()
  expect(log).toEqual(['sync', 'then', 'timeout'])
})

test('settles only once', async () => {
  const onOk = fn()
  const onErr = fn()
  new MyPromise((resolve, reject) => {
    resolve('first')
    resolve('second')
    reject(new Error('ignored'))
    throw new Error('also ignored')
  }).then(onOk, onErr)
  await clock.flush()
  expect(onOk.mock.calls).toEqual([['first']])
  expect(onErr).not.toHaveBeenCalled()
})

test('chains values and adopts promises returned from callbacks', async () => {
  const seen = fn()
  later(100, 2)
    .then((n) => n * 10)
    .then((n) => later(50, n + 1))
    .then(seen)
  await clock.tickAsync(149)
  expect(seen).not.toHaveBeenCalled()
  await clock.tickAsync(1)
  expect(seen).toHaveBeenCalledWith(21)
})

test('adopts thenables passed to resolve', async () => {
  const seen = fn()
  const thenable = { then: (onOk) => setTimeout(onOk, 30, 'from thenable') }
  new MyPromise((resolve) => resolve(thenable)).then(seen)
  await clock.tickAsync(30)
  expect(seen).toHaveBeenCalledWith('from thenable')
})

test('rejects when the executor throws, and catch recovers the chain', async () => {
  const err = new Error('boom')
  const skipped = fn()
  const seen = fn()
  new MyPromise(() => {
    throw err
  })
    .then(skipped)
    .catch((e) => (e === err ? 'recovered' : 'wrong error'))
    .then(seen)
  await clock.flush()
  expect(skipped).not.toHaveBeenCalled()
  expect(seen).toHaveBeenCalledWith('recovered')
})

test('an error thrown in a callback rejects the next promise', async () => {
  const err = new Error('in handler')
  const caught = fn()
  MyPromise.resolve(1)
    .then(() => {
      throw err
    })
    .then(null, caught)
  await clock.flush()
  expect(caught).toHaveBeenCalledWith(err)
})

test('runs several callbacks on one promise in registration order', async () => {
  const log = []
  const p = later(10, 'x')
  p.then(() => log.push('a'))
  p.then(() => log.push('b'))
  await clock.tickAsync(10)
  p.then(() => log.push('c'))
  await clock.flush()
  expect(log).toEqual(['a', 'b', 'c'])
})

test('finally runs with no arguments and passes the outcome through', async () => {
  const cb = fn()
  const err = new Error('kept')
  const ok = fn()
  const failed = fn()
  MyPromise.resolve('value').finally(cb).then(ok)
  MyPromise.reject(err).finally(cb).catch(failed)
  await clock.flush()
  expect(cb.mock.calls).toEqual([[], []])
  expect(ok).toHaveBeenCalledWith('value')
  expect(failed).toHaveBeenCalledWith(err)
})

test('static resolve returns MyPromise instances unchanged', async () => {
  const p = new MyPromise((resolve) => resolve(1))
  expect(MyPromise.resolve(p)).toBe(p)
  expect(MyPromise.resolve(5)).toBeInstanceOf(MyPromise)
  expect(MyPromise.reject('no')).toBeInstanceOf(MyPromise)
})

test('works with await', async () => {
  const result = (async () => {
    const a = await later(20, 'a')
    try {
      await MyPromise.reject(new Error('b'))
    } catch (e) {
      return a + e.message
    }
  })()
  const seen = fn()
  result.then(seen)
  await clock.tickAsync(20)
  expect(seen).toHaveBeenCalledWith('ab')
})
