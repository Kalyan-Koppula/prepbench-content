import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './useDebouncedValue'

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)))

test('returns the initial value immediately', () => {
  const { result } = renderHook(() => useDebouncedValue('a', 50))
  expect(result.current).toBe('a')
})

test('updates only after the delay', async () => {
  const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 60), { initialProps: { v: 'a' } })
  rerender({ v: 'b' })
  expect(result.current).toBe('a')
  await wait(100)
  expect(result.current).toBe('b')
})

test('rapid changes restart the wait', async () => {
  const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 100), { initialProps: { v: 'a' } })
  rerender({ v: 'b' })
  await wait(50)
  rerender({ v: 'c' })
  await wait(60) // 110ms after 'b', but only 60ms after 'c'
  expect(result.current).toBe('a')
  await wait(80)
  expect(result.current).toBe('c')
})

test('a new delay restarts the wait', async () => {
  const { result, rerender } = renderHook(({ v, d }) => useDebouncedValue(v, d), { initialProps: { v: 'a', d: 40 } })
  rerender({ v: 'b', d: 40 })
  rerender({ v: 'b', d: 150 })
  await wait(80) // the old 40ms timer must not fire
  expect(result.current).toBe('a')
  await wait(120)
  expect(result.current).toBe('b')
})

test('clears its timer on unmount', async () => {
  const cleared = jest.spyOn(globalThis, 'clearTimeout')
  const { rerender, unmount } = renderHook(({ v }) => useDebouncedValue(v, 50), { initialProps: { v: 'a' } })
  rerender({ v: 'b' })
  const before = cleared.mock.calls.length
  unmount()
  expect(cleared.mock.calls.length).toBeGreaterThan(before)
  cleared.mockRestore()
})
