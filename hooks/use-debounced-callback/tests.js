import { renderHook, act } from '@testing-library/react'
import { useDebouncedCallback } from './useDebouncedCallback'

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)))

test('runs once with the last arguments after calls stop', async () => {
  const fn = jest.fn()
  const { result } = renderHook(() => useDebouncedCallback(fn, 60))
  result.current('a')
  await wait(40)
  const before = fn.mock.calls.length // 0 unless a slow machine overslept
  const t = Date.now()
  result.current('b')
  await wait(35)
  if (Date.now() - t < 55) expect(fn).toHaveBeenCalledTimes(before)
  await wait(50)
  expect(fn).toHaveBeenCalledTimes(before + 1)
  expect(fn).toHaveBeenLastCalledWith('b')
})

test('keeps the same identity across renders', () => {
  const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 30), { initialProps: { cb: () => {} } })
  const first = result.current
  rerender({ cb: () => {} })
  rerender({ cb: () => {} })
  expect(result.current).toBe(first)
})

test('runs the latest fn when it fires', async () => {
  const oldFn = jest.fn()
  const newFn = jest.fn()
  const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 30), { initialProps: { cb: oldFn } })
  result.current(1)
  rerender({ cb: newFn })
  await wait(60)
  expect(oldFn).not.toHaveBeenCalled()
  expect(newFn).toHaveBeenCalledWith(1)
})

test('cancel drops the pending call', async () => {
  const fn = jest.fn()
  const { result } = renderHook(() => useDebouncedCallback(fn, 20))
  result.current('x')
  result.current.cancel()
  await wait(50)
  expect(fn).not.toHaveBeenCalled()
})

test('flush runs the pending call immediately, once', async () => {
  const fn = jest.fn()
  const { result } = renderHook(() => useDebouncedCallback(fn, 30))
  result.current('p')
  result.current('q')
  result.current.flush()
  expect(fn).toHaveBeenCalledTimes(1)
  expect(fn).toHaveBeenCalledWith('q')
  await wait(60)
  expect(fn).toHaveBeenCalledTimes(1)
})

test('flush with nothing pending does nothing', () => {
  const fn = jest.fn()
  const { result } = renderHook(() => useDebouncedCallback(fn, 30))
  result.current.flush()
  expect(fn).not.toHaveBeenCalled()
})

test('unmounting cancels a pending call', async () => {
  const fn = jest.fn()
  const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 20))
  result.current('late')
  unmount()
  await wait(50)
  expect(fn).not.toHaveBeenCalled()
})
