interface Version {
  core: number[]
  pre: string[]
}

function parseVersion(input: string): Version {
  const text = input.trim().replace(/^v/i, '').split('+')[0]
  const dash = text.indexOf('-')
  const coreText = dash === -1 ? text : text.slice(0, dash)
  const core = coreText.split('.').map(Number)
  while (core.length < 3) core.push(0)
  return { core, pre: dash === -1 ? [] : text.slice(dash + 1).split('.') }
}

const sign = (n: number): -1 | 0 | 1 => (n < 0 ? -1 : n > 0 ? 1 : 0)
const isNumeric = (id: string) => /^\d+$/.test(id)

function compareIdentifiers(x: string, y: string): -1 | 0 | 1 {
  const xNum = isNumeric(x)
  const yNum = isNumeric(y)
  if (xNum && yNum) return sign(Number(x) - Number(y))
  if (xNum) return -1
  if (yNum) return 1
  return x < y ? -1 : x > y ? 1 : 0
}

function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const va = parseVersion(a)
  const vb = parseVersion(b)
  for (let i = 0; i < 3; i++) {
    if (va.core[i] !== vb.core[i]) return sign(va.core[i] - vb.core[i])
  }
  if (!va.pre.length || !vb.pre.length) return sign(vb.pre.length - va.pre.length)
  for (let i = 0; i < Math.max(va.pre.length, vb.pre.length); i++) {
    if (va.pre[i] === undefined) return -1
    if (vb.pre[i] === undefined) return 1
    const result = compareIdentifiers(va.pre[i], vb.pre[i])
    if (result !== 0) return result
  }
  return 0
}
