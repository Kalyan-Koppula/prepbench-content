const fromValues = (...values) =>
  new Observable((o) => {
    for (const v of values) o.next(v)
    o.complete()
  })

const recorder = () => {
  const log = []
  return { log, observer: { next: (v) => log.push(['next', v]), error: (e) => log.push(['error', e]), complete: () => log.push(['complete']) } }
}

test('does nothing until subscribed, then runs the producer per subscriber', () => {
  const producer = fn((o) => o.next(1))
  const source = new Observable(producer)
  expect(producer).not.toHaveBeenCalled()
  source.subscribe(() => {})
  source.subscribe(() => {})
  expect(producer).toHaveBeenCalledTimes(2)
})

test('delivers values and completion to the observer', () => {
  const { log, observer } = recorder()
  fromValues('a', 'b').subscribe(observer)
  expect(log).toEqual([['next', 'a'], ['next', 'b'], ['complete']])
})

test('accepts a plain function as the next handler', () => {
  const next = fn()
  fromValues(1, 2).subscribe(next)
  expect(next.mock.calls).toEqual([[1], [2]])
})

test('ignores everything after complete or error', () => {
  const { log, observer } = recorder()
  new Observable((o) => {
    o.next(1)
    o.error('boom')
    o.next(2)
    o.complete()
    o.error('again')
  }).subscribe(observer)
  expect(log).toEqual([['next', 1], ['error', 'boom']])
})

test('sends an error thrown by the producer to error', () => {
  const error = fn()
  const err = new Error('bad source')
  new Observable(() => {
    throw err
  }).subscribe({ error })
  expect(error).toHaveBeenCalledWith(err)
})

// A source the test pushes values into by hand; `teardown` records cleanup.
const manualSource = () => {
  const teardown = fn()
  let observer
  const source = new Observable((o) => {
    observer = o
    return teardown
  })
  return { source, teardown, push: (v) => observer.next(v), finish: () => observer.complete() }
}

test('unsubscribe stops delivery and runs the teardown once', () => {
  const { source, teardown, push } = manualSource()
  const next = fn()
  const sub = source.subscribe(next)
  push(0)
  push(1)
  sub.unsubscribe()
  sub.unsubscribe()
  push(2)
  expect(next.mock.calls).toEqual([[0], [1]])
  expect(teardown).toHaveBeenCalledTimes(1)
})

test('runs the teardown after complete, even a synchronous one', () => {
  const { source, teardown, finish } = manualSource()
  source.subscribe({})
  expect(teardown).not.toHaveBeenCalled()
  finish()
  expect(teardown).toHaveBeenCalledTimes(1)

  const syncTeardown = fn()
  const sub = new Observable((o) => {
    o.complete()
    return syncTeardown
  }).subscribe({})
  expect(syncTeardown).toHaveBeenCalledTimes(1)
  sub.unsubscribe()
  expect(syncTeardown).toHaveBeenCalledTimes(1)
})

test('map and filter transform the stream and can be chained', () => {
  const { log, observer } = recorder()
  fromValues(1, 2, 3, 4)
    .filter((n) => n % 2 === 0)
    .map((n) => n * 10)
    .subscribe(observer)
  expect(log).toEqual([['next', 20], ['next', 40], ['complete']])
})

test('map and filter are lazy too', () => {
  const producer = fn((o) => o.next(1))
  const piped = new Observable(producer).map((x) => x).filter(() => true)
  expect(producer).not.toHaveBeenCalled()
  piped.subscribe(() => {})
  expect(producer).toHaveBeenCalledTimes(1)
})

test('an error thrown by the map function ends the stream', () => {
  const { log, observer } = recorder()
  const err = new Error('cannot map 2')
  fromValues(1, 2, 3)
    .map((n) => {
      if (n === 2) throw err
      return n
    })
    .subscribe(observer)
  expect(log).toEqual([['next', 1], ['error', err]])
})

test('unsubscribing from a mapped stream tears down the source', () => {
  const { source, teardown, push } = manualSource()
  const next = fn()
  const sub = source.map((x) => x + 1).subscribe(next)
  push(1)
  sub.unsubscribe()
  push(2)
  expect(teardown).toHaveBeenCalledTimes(1)
  expect(next.mock.calls).toEqual([[2]])
})
