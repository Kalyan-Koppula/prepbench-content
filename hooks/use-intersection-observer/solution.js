import { useState, useEffect, useRef } from 'react'

export function useIntersectionObserver(ref, { root = null, rootMargin = '0px', threshold = 0, once = false } = {}) {
  const [entry, setEntry] = useState(undefined)
  const done = useRef(false) // `once` already saw the element
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : String(threshold)

  useEffect(() => {
    const el = ref.current
    if (!el || (once && done.current)) return
    const observer = new IntersectionObserver(
      (entries) => {
        const latest = entries[entries.length - 1]
        setEntry(latest)
        if (once && latest.isIntersecting) {
          done.current = true
          observer.disconnect()
        }
      },
      { root, rootMargin, threshold: thresholdKey.split(',').map(Number) },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, root, rootMargin, thresholdKey, once])

  return { isIntersecting: !!entry?.isIntersecting, entry }
}
