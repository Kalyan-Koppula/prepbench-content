import { renderHook, act, cleanup } from '@testing-library/react'
import { useCopyToClipboard } from './useCopyToClipboard'

// jsdom has no clipboard. Browsers expose navigator.clipboard as a read-only
// getter, so install the fake with defineProperty and restore it afterwards.
// Some in-browser runners give the test a DOM `window` that is not `globalThis`,
// so cover both `navigator` and `window.navigator`.
const navigators = [...new Set([navigator, window.navigator])]
let writeText
let savedDescriptors

function setClipboard(value) {
  for (const nav of navigators) Object.defineProperty(nav, 'clipboard', { configurable: true, value })
}

beforeEach(() => {
  savedDescriptors = navigators.map((nav) => Object.getOwnPropertyDescriptor(nav, 'clipboard'))
  writeText = jest.fn(() => Promise.resolve())
  setClipboard({ writeText })
})
afterEach(() => {
  cleanup()
  navigators.forEach((nav, i) => {
    if (savedDescriptors[i]) Object.defineProperty(nav, 'clipboard', savedDescriptors[i])
    else delete nav.clipboard
  })
})

const wait = (ms) => act(() => new Promise((r) => setTimeout(r, ms)))

test('writes the text and sets copied', async () => {
  const { result } = renderHook(() => useCopyToClipboard(1000))
  let ok
  await act(async () => {
    ok = await result.current.copy('hello')
  })
  expect(writeText).toHaveBeenCalledWith('hello')
  expect(ok).toBe(true)
  expect(result.current.copied).toBe(true)
  expect(result.current.error).toBeUndefined()
})

test('copied goes back to false after resetAfter', async () => {
  const { result } = renderHook(() => useCopyToClipboard(30))
  await act(() => result.current.copy('x'))
  expect(result.current.copied).toBe(true)
  await wait(60)
  expect(result.current.copied).toBe(false)
})

test('copying again restarts the countdown', async () => {
  const { result } = renderHook(() => useCopyToClipboard(60))
  await act(() => result.current.copy('one'))
  await wait(40)
  const t = Date.now()
  await act(() => result.current.copy('two'))
  await wait(35)
  // (skip the check if a slow machine overslept past the new deadline)
  if (Date.now() - t < 55) expect(result.current.copied).toBe(true)
  await wait(50)
  expect(result.current.copied).toBe(false)
})

test('resolves false and stores the error when writing fails', async () => {
  const denied = new Error('Write permission denied')
  writeText.mockImplementation(() => Promise.reject(denied))
  const { result } = renderHook(() => useCopyToClipboard(1000))
  let ok
  await act(async () => {
    ok = await result.current.copy('secret')
  })
  expect(ok).toBe(false)
  expect(result.current.copied).toBe(false)
  expect(result.current.error).toBe(denied)
})

test('handles a missing Clipboard API without throwing', async () => {
  setClipboard(undefined)
  const { result } = renderHook(() => useCopyToClipboard(1000))
  let ok
  await act(async () => {
    ok = await result.current.copy('x')
  })
  expect(ok).toBe(false)
  expect(result.current.error).toBeInstanceOf(Error)
})

test('a later success clears the error', async () => {
  writeText.mockImplementationOnce(() => Promise.reject(new Error('blocked')))
  const { result } = renderHook(() => useCopyToClipboard(1000))
  await act(() => result.current.copy('a'))
  expect(result.current.error).toBeDefined()
  await act(() => result.current.copy('b'))
  expect(result.current.error).toBeUndefined()
  expect(result.current.copied).toBe(true)
})

test('copy keeps the same identity', async () => {
  const { result, rerender } = renderHook(() => useCopyToClipboard(1000))
  const copy = result.current.copy
  await act(() => result.current.copy('x'))
  rerender()
  expect(result.current.copy).toBe(copy)
})
