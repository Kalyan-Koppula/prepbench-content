import { renderHook, act } from '@testing-library/react'
import { useAsync } from './useAsync'

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

test('starts idle', () => {
  const { result } = renderHook(() => useAsync(() => Promise.resolve(1)))
  expect(result.current.status).toBe('idle')
  expect(result.current.data).toBeUndefined()
  expect(result.current.error).toBeUndefined()
})

test('goes pending then success, forwarding the arguments', async () => {
  const d = deferred()
  const fn = jest.fn(() => d.promise)
  const { result } = renderHook(() => useAsync(fn))
  act(() => result.current.run('ada', 2))
  expect(fn).toHaveBeenCalledWith('ada', 2)
  expect(result.current.status).toBe('pending')
  await act(async () => d.resolve({ name: 'Ada' }))
  expect(result.current.status).toBe('success')
  expect(result.current.data).toEqual({ name: 'Ada' })
})

test('captures a rejection in error', async () => {
  const d = deferred()
  const { result } = renderHook(() => useAsync(() => d.promise))
  act(() => result.current.run())
  const err = new Error('boom')
  await act(async () => d.reject(err))
  expect(result.current.status).toBe('error')
  expect(result.current.error).toBe(err)
  expect(result.current.data).toBeUndefined()
})

test('ignores an older run that resolves last', async () => {
  const calls = []
  const { result } = renderHook(() =>
    useAsync(() => {
      const d = deferred()
      calls.push(d)
      return d.promise
    }),
  )
  act(() => result.current.run())
  act(() => result.current.run())
  await act(async () => calls[1].resolve('new'))
  await act(async () => calls[0].resolve('old'))
  expect(result.current.data).toBe('new')
  expect(result.current.status).toBe('success')
})

test('stays pending when an older run settles first', async () => {
  const calls = []
  const { result } = renderHook(() =>
    useAsync(() => {
      const d = deferred()
      calls.push(d)
      return d.promise
    }),
  )
  act(() => result.current.run())
  act(() => result.current.run())
  await act(async () => calls[0].reject(new Error('stale')))
  expect(result.current.status).toBe('pending')
  expect(result.current.error).toBeUndefined()
  await act(async () => calls[1].resolve('fresh'))
  expect(result.current.data).toBe('fresh')
})

test('keeps the previous data while a new run is pending', async () => {
  let n = 0
  const ds = [deferred(), deferred()]
  const { result } = renderHook(() => useAsync(() => ds[n++].promise))
  act(() => result.current.run())
  await act(async () => ds[0].resolve('first'))
  act(() => result.current.run())
  expect(result.current.status).toBe('pending')
  expect(result.current.data).toBe('first')
})

test('run is stable and calls the latest function', async () => {
  const first = jest.fn(() => Promise.resolve('one'))
  const second = jest.fn(() => Promise.resolve('two'))
  const { result, rerender } = renderHook(({ fn }) => useAsync(fn), { initialProps: { fn: first } })
  const run = result.current.run
  rerender({ fn: second })
  expect(result.current.run).toBe(run)
  await act(async () => result.current.run())
  expect(first).not.toHaveBeenCalled()
  expect(result.current.data).toBe('two')
})
