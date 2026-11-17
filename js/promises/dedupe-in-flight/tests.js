const setTimeout = window.setTimeout // timers on the fake clock
const after = (ms, value) => new Promise((resolve) => setTimeout(resolve, ms, value))
const failAfter = (ms, reason) => {
  const p = new Promise((_, reject) => setTimeout(reject, ms, reason))
  p.catch(() => {})
  return p
}
function track(p) {
  const s = { settled: false }
  Promise.resolve(p).then(
    (value) => Object.assign(s, { settled: true, status: 'fulfilled', value }),
    (reason) => Object.assign(s, { settled: true, status: 'rejected', reason }),
  )
  return s
}

test('concurrent calls with the same arguments share one call and one promise', async () => {
  const load = fn((id) => after(50, 'user ' + id))
  const getUser = dedupe(load)
  const a = getUser(7)
  const b = getUser(7)
  expect(b).toBe(a)
  expect(load).toHaveBeenCalledTimes(1)
  const sa = track(a)
  const sb = track(b)
  await clock.tickAsync(50)
  expect([sa.value, sb.value]).toEqual(['user 7', 'user 7'])
})

test('different arguments get separate calls', () => {
  const load = fn((id) => after(50, id))
  const getUser = dedupe(load)
  const a = getUser(1)
  const b = getUser(2)
  expect(a).not.toBe(b)
  expect(load.mock.calls).toEqual([[1], [2]])
})

test('starts a fresh call after the previous one settles', async () => {
  const load = fn((id) => after(10, id))
  const getUser = dedupe(load)
  getUser(1)
  await clock.tickAsync(10)
  getUser(1)
  expect(load).toHaveBeenCalledTimes(2)
})

test('shares a rejection with every caller, then forgets the key', async () => {
  const err = new Error('503')
  const load = fn(() => failAfter(20, err))
  const getUser = dedupe(load)
  const a = track(getUser(1))
  const b = track(getUser(1))
  await clock.tickAsync(20)
  expect([a.reason, b.reason]).toEqual([err, err])
  track(getUser(1))
  expect(load).toHaveBeenCalledTimes(2)
})

test('the key is already cleared when callers handle the result', async () => {
  const load = fn()
  load.mockImplementationOnce(() => failAfter(10, new Error('flaky')))
  load.mockImplementationOnce(() => after(10, 'second try'))
  const getUser = dedupe(load)
  const retried = track(getUser(1).catch(() => getUser(1)))
  await clock.tickAsync(20)
  expect(load).toHaveBeenCalledTimes(2)
  expect(retried.value).toBe('second try')
})

test('settling one key leaves other keys in flight', async () => {
  const load = fn((id, ms) => after(ms, id))
  const get = dedupe(load, (id) => id)
  get('fast', 10)
  get('slow', 50)
  await clock.tickAsync(10)
  get('slow', 50)
  expect(load).toHaveBeenCalledTimes(2)
})

test('uses the custom key function', () => {
  const load = fn((query) => after(10, query))
  const search = dedupe(load, (query) => query.term.toLowerCase())
  const a = search({ term: 'Shoes', page: 1 })
  const b = search({ term: 'shoes', page: 2 })
  expect(b).toBe(a)
  expect(load).toHaveBeenCalledTimes(1)
})

test('forwards `this` and every argument', () => {
  const load = fn(function () {
    return after(10, this.base)
  })
  const api = { base: '/v2', get: dedupe(load) }
  api.get('users', { limit: 5 })
  expect(load.mock.contexts[0]).toBe(api)
  expect(load.mock.calls[0]).toEqual(['users', { limit: 5 }])
})

test('a synchronous throw becomes a rejection and is not remembered', async () => {
  const err = new Error('bad id')
  const load = fn(() => {
    throw err
  })
  const getUser = dedupe(load)
  let p
  expect(() => (p = getUser(1))).not.toThrow()
  const s = track(p)
  await clock.flush()
  expect(s.reason).toBe(err)
  track(getUser(1))
  expect(load).toHaveBeenCalledTimes(2)
})
