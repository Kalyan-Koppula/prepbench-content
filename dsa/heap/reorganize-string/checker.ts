function check(args: any[], output: any, expected: any): boolean | string {
  const s: string = args[0]
  if (typeof output !== 'string') return 'expected a string'
  const counts = new Map<string, number>()
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  const maxCount = Math.max(...counts.values())
  const possible = maxCount <= Math.ceil(s.length / 2)
  if (!possible) return output === '' ? true : 'no valid arrangement exists; expected ""'
  if (output === '') return 'a valid arrangement exists'
  if (output.length !== s.length) return 'output length differs from s'
  for (const ch of output) {
    const left = counts.get(ch) ?? 0
    if (left === 0) return 'output is not a rearrangement of s'
    counts.set(ch, left - 1)
  }
  for (let i = 1; i < output.length; i++) {
    if (output[i] === output[i - 1]) return `adjacent equal characters at index ${i - 1}`
  }
  return true
}
