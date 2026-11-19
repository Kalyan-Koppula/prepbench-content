function isAlphanumeric(code: number): boolean {
  const isDigit = code >= 48 && code <= 57 // '0'..'9'
  const isUpper = code >= 65 && code <= 90 // 'A'..'Z'
  const isLower = code >= 97 && code <= 122 // 'a'..'z'
  return isDigit || isUpper || isLower
}

function toLowerCode(code: number): number {
  if (code >= 65 && code <= 90) {
    return code + 32 // 'A' + 32 === 'a' in ASCII
  }
  return code
}

function isPalindrome(s: string): boolean {
  let left = 0
  let right = s.length - 1
  while (left < right) {
    // Skip characters that do not take part in the comparison.
    // The left < right guard stops the pointers from crossing on strings
    // made mostly of punctuation.
    while (left < right && !isAlphanumeric(s.charCodeAt(left))) {
      left++
    }
    while (left < right && !isAlphanumeric(s.charCodeAt(right))) {
      right--
    }
    if (toLowerCode(s.charCodeAt(left)) !== toLowerCode(s.charCodeAt(right))) {
      return false
    }
    left++
    right--
  }
  return true
}
