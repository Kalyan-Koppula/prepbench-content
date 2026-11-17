import { useRef } from 'react'
import { render, act, cleanup } from '@testing-library/react'
import { useIntersectionObserver } from './useIntersectionObserver'

// jsdom has no IntersectionObserver. This fake records every instance; call
// `show(observer, el, true)` to deliver an entry like the browser would.
let observers
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

class FakeIntersectionObserver {
  constructor(callback, options = {}) {
    this.callback = callback
    this.options = options
    this.targets = new Set()
    this.disconnected = false
    observers.push(this)
  }
  observe(el) {
    this.targets.add(el)
  }
  unobserve(el) {
    this.targets.delete(el)
  }
  disconnect() {
    this.disconnected = true
    this.targets.clear()
  }
  takeRecords() {
    return []
  }
}

function show(observer, el, isIntersecting) {
  if (!observer.targets.has(el)) return
  const entry = { target: el, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0, time: Date.now() }
  act(() => observer.callback([entry], observer))
}

beforeEach(() => {
  observers = []
  installGlobal('IntersectionObserver', FakeIntersectionObserver)
})
afterEach(() => {
  cleanup()
  restoreGlobal('IntersectionObserver')
})

let latest
function Section({ options, mounted = true }) {
  const ref = useRef(null)
  latest = useIntersectionObserver(ref, options)
  return mounted ? <section ref={ref} data-testid="target" /> : null
}
const live = () => observers.filter((o) => !o.disconnected)

test('observes the element with the given options', () => {
  const { getByTestId } = render(<Section options={{ rootMargin: '100px', threshold: 0.5 }} />)
  expect(live()).toHaveLength(1)
  expect(live()[0].targets.has(getByTestId('target'))).toBe(true)
  expect(live()[0].options.rootMargin).toBe('100px')
  expect([].concat(live()[0].options.threshold)).toEqual([0.5])
})

test('reports entries as the element enters and leaves', () => {
  const { getByTestId } = render(<Section options={{}} />)
  expect(latest.isIntersecting).toBe(false)
  expect(latest.entry).toBeUndefined()
  show(live()[0], getByTestId('target'), true)
  expect(latest.isIntersecting).toBe(true)
  expect(latest.entry.target).toBe(getByTestId('target'))
  show(live()[0], getByTestId('target'), false)
  expect(latest.isIntersecting).toBe(false)
})

test('does not recreate the observer for an equal options object', () => {
  const { rerender } = render(<Section options={{ threshold: [0, 1] }} />)
  rerender(<Section options={{ threshold: [0, 1] }} />)
  rerender(<Section options={{ threshold: [0, 1] }} />)
  expect(observers).toHaveLength(1)
  expect(observers[0].disconnected).toBe(false)
})

test('recreates the observer when an option changes', () => {
  const { rerender, getByTestId } = render(<Section options={{ threshold: 0 }} />)
  rerender(<Section options={{ threshold: 1 }} />)
  expect(observers[0].disconnected).toBe(true)
  expect(live()).toHaveLength(1)
  expect([].concat(live()[0].options.threshold)).toEqual([1])
  expect(live()[0].targets.has(getByTestId('target'))).toBe(true)
})

test('with once, stops observing after the element is first visible', () => {
  const { getByTestId, rerender } = render(<Section options={{ once: true }} />)
  const first = live()[0]
  show(first, getByTestId('target'), true)
  expect(latest.isIntersecting).toBe(true)
  expect(live()).toHaveLength(0)
  rerender(<Section options={{ once: true }} />)
  show(first, getByTestId('target'), false)
  expect(live()).toHaveLength(0)
  expect(latest.isIntersecting).toBe(true)
})

test('disconnects on unmount', () => {
  const { unmount } = render(<Section options={{}} />)
  unmount()
  expect(observers.length).toBeGreaterThan(0)
  expect(live()).toHaveLength(0)
})

test('creates nothing when the ref is empty', () => {
  render(<Section options={{}} mounted={false} />)
  expect(observers).toHaveLength(0)
  expect(latest.isIntersecting).toBe(false)
})
