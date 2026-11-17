import { useState, useCallback } from 'react'

export function useArray(initial = []) {
  // TODO
  return {
    array: initial,
    set: () => {},
    push: () => {},
    remove: () => {},
    update: () => {},
    clear: () => {},
  }
}
