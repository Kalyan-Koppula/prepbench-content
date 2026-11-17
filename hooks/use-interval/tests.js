import { renderHook, render, screen, act, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { useInterval } from './useInterval'

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)))

test('calls the callback repeatedly', async () => {
  const cb = jest.fn()
  renderHook(() => useInterval(cb, 20))
  await wait(90)
  expect(cb.mock.calls.length).toBeGreaterThanOrEqual(2)
  expect(cb.mock.calls.length).toBeLessThanOrEqual(5)
})

test('sees the latest state (no stale closure)', async () => {
  function Ticker() {
    const [n, setN] = useState(0)
    useInterval(() => setN(n + 1), 10)
    return <span data-testid="n">{n}</span>
  }
  render(<Ticker />)
  // waitFor lets React re-render between ticks, like a real browser does
  await waitFor(() => expect(Number(screen.getByTestId('n').textContent)).toBeGreaterThanOrEqual(2), { timeout: 300, interval: 5 })
})

test('keeps ticking when the component re-renders faster than the delay', async () => {
  const cb = jest.fn()
  const { rerender } = renderHook(({ fn }) => useInterval(fn, 40), { initialProps: { fn: () => cb() } })
  for (let i = 0; i < 7; i++) {
    await wait(15)
    rerender({ fn: () => cb() })
  }
  expect(cb).toHaveBeenCalled()
})

test('calls the newest callback after it changes', async () => {
  const first = jest.fn()
  const second = jest.fn()
  const { rerender } = renderHook(({ fn }) => useInterval(fn, 20), { initialProps: { fn: first } })
  rerender({ fn: second })
  await wait(70)
  expect(first).not.toHaveBeenCalled()
  expect(second).toHaveBeenCalled()
})

test('a null delay pauses and a number resumes', async () => {
  const cb = jest.fn()
  const { rerender } = renderHook(({ d }) => useInterval(cb, d), { initialProps: { d: null } })
  await wait(50)
  expect(cb).not.toHaveBeenCalled()
  rerender({ d: 15 })
  await wait(60)
  expect(cb).toHaveBeenCalled()
  rerender({ d: null })
  const count = cb.mock.calls.length
  await wait(50)
  expect(cb.mock.calls.length).toBe(count)
})

test('stops after unmount', async () => {
  const cb = jest.fn()
  const { unmount } = renderHook(() => useInterval(cb, 15))
  await wait(40)
  unmount()
  const count = cb.mock.calls.length
  await wait(50)
  expect(cb.mock.calls.length).toBe(count)
})
