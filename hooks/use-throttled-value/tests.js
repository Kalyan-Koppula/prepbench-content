import { renderHook, act } from '@testing-library/react'
import { useThrottledValue } from './useThrottledValue'

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)))

test('returns the initial value immediately', () => {
  const { result } = renderHook(() => useThrottledValue('start', 50))
  expect(result.current).toBe('start')
})

test('shows a change immediately after a quiet period', async () => {
  const { result, rerender } = renderHook(({ v }) => useThrottledValue(v, 40), { initialProps: { v: 1 } })
  await wait(60)
  rerender({ v: 2 })
  expect(result.current).toBe(2)
})

test('holds later changes until the interval is up, then shows the latest', async () => {
  const { result, rerender } = renderHook(({ v }) => useThrottledValue(v, 60), { initialProps: { v: 'a' } })
  await wait(70)
  const t = Date.now()
  rerender({ v: 'b' })
  rerender({ v: 'c' })
  rerender({ v: 'd' })
  if (Date.now() - t < 50) expect(result.current).toBe('b')
  await wait(20)
  // (these checks are skipped if a slow machine overslept past the window)
  if (Date.now() - t < 50) expect(result.current).toBe('b')
  await wait(70)
  expect(result.current).toBe('d')
})

test('keeps updating while the value keeps changing', async () => {
  const { result, rerender } = renderHook(({ v }) => useThrottledValue(v, 25), { initialProps: { v: 0 } })
  await wait(30)
  const seen = new Set()
  for (let i = 1; i <= 9; i++) {
    rerender({ v: i })
    await wait(10)
    seen.add(result.current)
  }
  const intermediate = [...seen].filter((v) => v > 0 && v < 9)
  expect(intermediate.length).toBeGreaterThanOrEqual(2)
})

test('never loses the final value', async () => {
  const { result, rerender } = renderHook(({ v }) => useThrottledValue(v, 30), { initialProps: { v: 0 } })
  for (let i = 1; i <= 5; i++) {
    rerender({ v: i })
    await wait(5)
  }
  await wait(60)
  expect(result.current).toBe(5)
})

test('does not change more often than the interval', async () => {
  const shown = []
  const { rerender } = renderHook(
    ({ v }) => {
      const t = useThrottledValue(v, 50)
      if (shown[shown.length - 1] !== t) shown.push(t)
      return t
    },
    { initialProps: { v: 0 } },
  )
  const start = Date.now()
  for (let i = 1; i <= 8; i++) {
    rerender({ v: i })
    await wait(10)
  }
  // ~80 ms of changes with a 50 ms interval: the initial value plus one change per window
  const windows = Math.ceil((Date.now() - start) / 50)
  expect(shown.length).toBeLessThanOrEqual(1 + windows)
})
