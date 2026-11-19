function isAlphanumeric(code: number): boolean {
  const isDigit = code >= 48 && code <= 57
  const isUpper = code >= 65 && code <= 90
  const isLower = code >= 97 && code <= 122
  return isDigit || isUpper || isLower
}

function isPalindrome(s: string): boolean {
  // Build the cleaned, lower-cased sequence, then compare it with its reverse.
  const cleaned: number[] = []
  for (let i = 0; i < s.length; i++) {
    let code = s.charCodeAt(i)
    if (!isAlphanumeric(code)) {
      continue
    }
    if (code >= 65 && code <= 90) {
      code = code + 32
    }
    cleaned.push(code)
  }
  const reversed: number[] = []
  for (let i = cleaned.length - 1; i >= 0; i--) {
    reversed.push(cleaned[i])
  }
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] !== reversed[i]) {
      return false
    }
  }
  return true
}
