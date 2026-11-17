import { useState, useRef, useCallback, useEffect } from 'react'

export function useAsync(asyncFn) {
  // TODO
  return { run: () => {}, status: 'idle', data: undefined, error: undefined }
}
