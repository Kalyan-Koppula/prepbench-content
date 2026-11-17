import { useState, useRef, useCallback, useEffect } from 'react'

export function useCopyToClipboard(resetAfter = 2000) {
  // TODO
  return { copy: async () => false, copied: false, error: undefined }
}
