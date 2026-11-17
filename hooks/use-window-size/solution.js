import { useState, useEffect } from 'react'

const measure = () => ({ width: window.innerWidth, height: window.innerHeight })

export function useWindowSize() {
  const [size, setSize] = useState(measure)

  useEffect(() => {
    function onResize() {
      const next = measure()
      setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next))
    }
    onResize() // catch a resize that happened between render and subscribing
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return size
}
