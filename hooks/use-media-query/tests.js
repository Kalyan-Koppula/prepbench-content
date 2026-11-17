import { renderHook, act, cleanup } from '@testing-library/react'
import { useMediaQuery } from './useMediaQuery'

// jsdom has no matchMedia. This fake behaves like the browser's: every call
// returns a new MediaQueryList with its own listeners.
let media
// Some in-browser runners give the test a DOM `window` that is not `globalThis`,
// so the fake goes on both: the hook may say `window.X` or just `X`.
const scopes = [...new Set([window, globalThis])]
const savedGlobals = new Map()
function installGlobal(name, value) {
  for (const scope of scopes) {
    savedGlobals.set(scope, Object.getOwnPropertyDescriptor(scope, name))
    Object.defineProperty(scope, name, { configurable: true, writable: true, value })
  }
}
function restoreGlobal(name) {
  for (const scope of scopes) {
    const descriptor = savedGlobals.get(scope)
    if (descriptor) Object.defineProperty(scope, name, descriptor)
    else delete scope[name]
  }
}

function createMatchMedia() {
  const answers = {}
  const lists = []
  const matchMedia = (query) => {
    const listeners = new Set()
    const mql = {
      media: query,
      get matches() {
        return !!answers[query]
      },
      onchange: null,
      addEventListener: (type, fn) => type === 'change' && listeners.add(fn),
      removeEventListener: (type, fn) => type === 'change' && listeners.delete(fn),
      addListener: (fn) => listeners.add(fn),
      removeListener: (fn) => listeners.delete(fn),
      dispatchEvent: () => true,
      listeners,
    }
    lists.push(mql)
    return mql
  }
  return {
    matchMedia,
    set(query, value) {
      answers[query] = value
      for (const mql of lists.filter((l) => l.media === query))
        for (const fn of [...mql.listeners]) fn({ matches: value, media: query })
    },
    listenerCount: (query) => lists.filter((l) => l.media === query).reduce((n, l) => n + l.listeners.size, 0),
  }
}

beforeEach(() => {
  media = createMatchMedia()
  installGlobal('matchMedia', jest.fn(media.matchMedia))
})
afterEach(() => {
  cleanup() // unmount first, so cleanups still see the fake
  restoreGlobal('matchMedia')
})

test('returns the current answer on the very first render', () => {
  media.set('(min-width: 800px)', true)
  const seen = []
  renderHook(() => {
    const v = useMediaQuery('(min-width: 800px)')
    seen.push(v)
    return v
  })
  expect(seen[0]).toBe(true)
})

test('returns false when the query does not match', () => {
  const { result } = renderHook(() => useMediaQuery('(orientation: portrait)'))
  expect(result.current).toBe(false)
})

test('updates when the media query starts and stops matching', () => {
  const { result } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'))
  act(() => media.set('(prefers-color-scheme: dark)', true))
  expect(result.current).toBe(true)
  act(() => media.set('(prefers-color-scheme: dark)', false))
  expect(result.current).toBe(false)
})

test('follows a new query and stops listening to the old one', () => {
  media.set('(max-width: 600px)', true)
  const { result, rerender } = renderHook(({ q }) => useMediaQuery(q), { initialProps: { q: '(max-width: 600px)' } })
  expect(result.current).toBe(true)
  rerender({ q: '(max-width: 300px)' })
  expect(result.current).toBe(false)
  expect(media.listenerCount('(max-width: 600px)')).toBe(0)
  act(() => media.set('(max-width: 600px)', false))
  act(() => media.set('(max-width: 600px)', true))
  expect(result.current).toBe(false)
})

test('removes its listener on unmount', () => {
  const { unmount } = renderHook(() => useMediaQuery('(hover: hover)'))
  expect(media.listenerCount('(hover: hover)')).toBeGreaterThan(0)
  unmount()
  expect(media.listenerCount('(hover: hover)')).toBe(0)
})
