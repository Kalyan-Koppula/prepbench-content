import { useState } from 'react'

export function usePrevious(value) {
  const [track, setTrack] = useState({ current: value, previous: undefined })

  // Adjusting state during render: React re-runs this component immediately,
  // before committing, so callers never see the stale pair.
  if (!Object.is(track.current, value)) {
    setTrack({ current: value, previous: track.current })
    return track.current
  }

  return track.previous
}
