import { renderHook, act } from '@testing-library/react'
import { useTimeout } from './useTimeout'

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)))

test('calls the callback once after the delay', async () => {
  const cb = jest.fn()
  renderHook(() => useTimeout(cb, 20))
  expect(cb).not.toHaveBeenCalled()
  await wait(50)
  expect(cb).toHaveBeenCalledTimes(1)
  await wait(40)
  expect(cb).toHaveBeenCalledTimes(1)
})

test('clear cancels the pending call', async () => {
  const cb = jest.fn()
  const { result } = renderHook(() => useTimeout(cb, 20))
  act(() => result.current.clear())
  await wait(50)
  expect(cb).not.toHaveBeenCalled()
})

test('reset restarts the countdown', async () => {
  const cb = jest.fn()
  const { result } = renderHook(() => useTimeout(cb, 60))
  await wait(40)
  const before = cb.mock.calls.length // 0 unless a slow machine overslept
  const t = Date.now()
  act(() => result.current.reset())
  await wait(35)
  if (Date.now() - t < 55) expect(cb).toHaveBeenCalledTimes(before)
  await wait(45)
  expect(cb).toHaveBeenCalledTimes(before + 1)
})

test('reset schedules again after the timeout has fired', async () => {
  const cb = jest.fn()
  const { result } = renderHook(() => useTimeout(cb, 15))
  await wait(40)
  act(() => result.current.reset())
  await wait(40)
  expect(cb).toHaveBeenCalledTimes(2)
})

test('calls the latest callback', async () => {
  const first = jest.fn()
  const second = jest.fn()
  const { rerender } = renderHook(({ fn }) => useTimeout(fn, 30), { initialProps: { fn: first } })
  rerender({ fn: second })
  await wait(60)
  expect(first).not.toHaveBeenCalled()
  expect(second).toHaveBeenCalledTimes(1)
})

test('a new callback on every render does not delay the call', async () => {
  const cb = jest.fn()
  const { rerender } = renderHook(({ fn }) => useTimeout(fn, 40), { initialProps: { fn: () => cb() } })
  for (let i = 0; i < 6; i++) {
    await wait(15)
    rerender({ fn: () => cb() })
  }
  expect(cb).toHaveBeenCalledTimes(1)
})

test('a null delay never fires', async () => {
  const cb = jest.fn()
  renderHook(() => useTimeout(cb, null))
  await wait(40)
  expect(cb).not.toHaveBeenCalled()
})

test('unmounting cancels the pending call', async () => {
  const cb = jest.fn()
  const { unmount } = renderHook(() => useTimeout(cb, 20))
  unmount()
  await wait(50)
  expect(cb).not.toHaveBeenCalled()
})
