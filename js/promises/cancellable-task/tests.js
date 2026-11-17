const setTimeout = window.setTimeout // timers on the fake clock
const start = clock.now()
function track(p) {
  const s = { settled: false }
  Promise.resolve(p).then(
    (value) => Object.assign(s, { settled: true, status: 'fulfilled', value, at: clock.now() - start }),
    (reason) => Object.assign(s, { settled: true, status: 'rejected', reason, at: clock.now() - start }),
  )
  return s
}
// A task that finishes after `ms` and remembers the signal it was given.
function slowTask(ms, value = 'done') {
  const task = fn((signal) => {
    task.signal = signal
    return new Promise((resolve) => setTimeout(resolve, ms, value))
  })
  return task
}

test('fulfils with the task result and passes it a signal', async () => {
  const task = slowTask(50, 'report')
  const s = track(cancellable(task))
  expect(task).toHaveBeenCalledTimes(1)
  expect(task.signal).toBeInstanceOf(AbortSignal)
  await clock.tickAsync(50)
  expect(s.value).toBe('report')
})

test('passes a task rejection through', async () => {
  const err = new Error('500')
  const s = track(cancellable(() => Promise.reject(err)))
  await clock.flush()
  expect(s.reason).toBe(err)
})

test('rejects with AbortError as soon as the caller aborts', async () => {
  const controller = new AbortController()
  const task = slowTask(100)
  const s = track(cancellable(task, { signal: controller.signal }))
  await clock.tickAsync(30)
  controller.abort()
  await clock.flush()
  expect(s.status).toBe('rejected')
  expect(s.reason.name).toBe('AbortError')
  expect(s.at).toBe(30)
  expect(task.signal.aborted).toBe(true)
})

test('gives the task its own signal, not the caller one', () => {
  const controller = new AbortController()
  const task = slowTask(10)
  cancellable(task, { signal: controller.signal })
  expect(task).toHaveBeenCalledTimes(1)
  expect(task.signal).not.toBe(controller.signal)
})

test('does not start the task if the signal is already aborted', async () => {
  const controller = new AbortController()
  controller.abort()
  const task = slowTask(10)
  const s = track(cancellable(task, { signal: controller.signal }))
  await clock.flush()
  expect(task).not.toHaveBeenCalled()
  expect(s.reason.name).toBe('AbortError')
})

test('rejects with TimeoutError after the timeout and aborts the task', async () => {
  const task = slowTask(500)
  const s = track(cancellable(task, { timeout: 200 }))
  await clock.tickAsync(199)
  expect(s.settled).toBe(false)
  await clock.tickAsync(1)
  expect(s.reason.name).toBe('TimeoutError')
  expect(task.signal.aborted).toBe(true)
})

test('clears the timeout once the task finishes', async () => {
  const s = track(cancellable(slowTask(20), { timeout: 1000 }))
  await clock.tickAsync(20)
  expect(s.value).toBe('done')
  expect(clock.pending()).toBe(0)
})

test('clears the timeout when the caller aborts', async () => {
  const controller = new AbortController()
  cancellable(() => new Promise(() => {}), { signal: controller.signal, timeout: 1000 }).catch(() => {})
  controller.abort()
  await clock.flush()
  expect(clock.pending()).toBe(0)
})

test('stops listening to the caller signal once settled', async () => {
  const controller = new AbortController()
  const task = slowTask(10)
  const s = track(cancellable(task, { signal: controller.signal }))
  await clock.tickAsync(10)
  controller.abort()
  await clock.flush()
  expect(s.value).toBe('done')
  expect(task.signal.aborted).toBe(false)
})

test('ignores the task result after an abort', async () => {
  const controller = new AbortController()
  const s = track(cancellable(slowTask(50), { signal: controller.signal }))
  controller.abort()
  await clock.tickAsync(100)
  expect(s.status).toBe('rejected')
  expect(s.reason.name).toBe('AbortError')
})

test('rejects when the task throws synchronously', async () => {
  const err = new Error('bad config')
  const s = track(
    cancellable(() => {
      throw err
    }, { timeout: 100 }),
  )
  await clock.flush()
  expect(s.reason).toBe(err)
  expect(clock.pending()).toBe(0)
})
