// Round half away from zero using the decimal string, not the binary value:
// '1.005e2' is exactly 100.5, whereas 1.005 * 100 is 100.49999999999999.
function roundHalfAway(abs: number, decimals: number): number {
  return Number(Math.round(Number(`${abs}e${decimals}`)) + `e-${decimals}`)
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatNumber(value: number, decimals?: number): string {
  const abs = Math.abs(value)
  const rounded = decimals === undefined ? abs : roundHalfAway(abs, decimals)
  const text = decimals === undefined ? String(rounded) : rounded.toFixed(decimals)
  const [whole, fraction] = text.split('.')
  const sign = value < 0 && rounded !== 0 ? '-' : ''
  return sign + groupThousands(whole) + (fraction !== undefined ? '.' + fraction : '')
}

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

function formatBytes(bytes: number, decimals = 1): string {
  const abs = Math.abs(bytes)
  let unit = 0
  while (unit < UNITS.length - 1 && abs >= 1024 ** (unit + 1)) unit++
  let rounded = roundHalfAway(abs / 1024 ** unit, decimals)
  if (rounded >= 1024 && unit < UNITS.length - 1) {
    unit++
    rounded = roundHalfAway(abs / 1024 ** unit, decimals)
  }
  const sign = bytes < 0 && rounded !== 0 ? '-' : ''
  return `${sign}${formatNumber(rounded)} ${UNITS[unit]}`
}
