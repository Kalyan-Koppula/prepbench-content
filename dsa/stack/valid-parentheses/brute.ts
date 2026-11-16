function isValid(s: string): boolean {
  // Repeatedly delete adjacent matched pairs.
  let prev = ''
  while (prev !== s) {
    prev = s
    s = s.replace('()', '').replace('[]', '').replace('{}', '')
  }
  return s.length === 0
}
