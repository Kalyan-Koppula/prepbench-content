import { useEffect, useRef } from 'react'

export function useEventListener(eventName, handler, target, options) {
  const saved = useRef(handler)

  useEffect(() => {
    saved.current = handler
  }, [handler])

  // Key the effect on primitives so an inline `{ passive: true }` doesn't resubscribe every render.
  const capture = !!options?.capture
  const passive = options?.passive
  const once = options?.once

  useEffect(() => {
    const el = target === undefined ? window : target && 'current' in target ? target.current : target
    if (!el || !el.addEventListener) return
    const listener = (event) => saved.current(event)
    el.addEventListener(eventName, listener, { capture, passive, once })
    return () => el.removeEventListener(eventName, listener, { capture })
  }, [eventName, target, capture, passive, once])
}
