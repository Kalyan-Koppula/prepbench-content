import { useState, useCallback } from 'react'

export function useCounter(initial = 0, { min, max, step = 1 } = {}) {
  // TODO
  return {
    count: initial,
    increment: () => {},
    decrement: () => {},
    set: () => {},
    reset: () => {},
  }
}
