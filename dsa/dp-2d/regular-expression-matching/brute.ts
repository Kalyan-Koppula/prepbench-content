// The pattern language here is a subset of JavaScript regular expressions.
function isMatch(s: string, p: string): boolean {
  return new RegExp('^(?:' + p + ')$').test(s)
}
