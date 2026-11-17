describe('formatNumber', () => {
  test('groups the integer part in threes', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(0)).toBe('0')
  })

  test('keeps the written decimals when none are requested', () => {
    expect(formatNumber(1234.5)).toBe('1,234.5')
    expect(formatNumber(1234567.891)).toBe('1,234,567.891')
    expect(formatNumber(0.125)).toBe('0.125')
    expect(formatNumber(-9876543.21)).toBe('-9,876,543.21')
  })

  test('pads to the requested number of decimals', () => {
    expect(formatNumber(1234.5, 2)).toBe('1,234.50')
    expect(formatNumber(7, 3)).toBe('7.000')
    expect(formatNumber(1234.56, 0)).toBe('1,235')
  })

  test('rounds half away from zero', () => {
    expect(formatNumber(2.5, 0)).toBe('3')
    expect(formatNumber(-2.5, 0)).toBe('-3')
    expect(formatNumber(0.125, 2)).toBe('0.13')
    expect(formatNumber(-0.125, 2)).toBe('-0.13')
  })

  test('rounds the decimal value as written, not its binary approximation', () => {
    expect(formatNumber(1.005, 2)).toBe('1.01')
    expect(formatNumber(1.255, 2)).toBe('1.26')
    expect(formatNumber(-4.725, 2)).toBe('-4.73')
    expect(formatNumber(1.0049, 2)).toBe('1.00')
  })

  test('carries rounding into the grouped digits', () => {
    expect(formatNumber(999999.996, 2)).toBe('1,000,000.00')
    expect(formatNumber(999.5, 0)).toBe('1,000')
  })

  test('never shows a negative zero', () => {
    expect(formatNumber(-0.004, 2)).toBe('0.00')
    expect(formatNumber(-0.4, 0)).toBe('0')
    expect(formatNumber(-0)).toBe('0')
  })
})

describe('formatBytes', () => {
  test('keeps values under 1024 in bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1)).toBe('1 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1023)).toBe('1,023 B')
  })

  test('picks the largest unit and drops trailing zeros', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
    expect(formatBytes(1075)).toBe('1 KB')
    expect(formatBytes(1024 ** 2)).toBe('1 MB')
    expect(formatBytes(5 * 1024 ** 3)).toBe('5 GB')
    expect(formatBytes(1234567)).toBe('1.2 MB')
  })

  test('honours the decimals argument with half-away rounding', () => {
    expect(formatBytes(1234567, 2)).toBe('1.18 MB')
    expect(formatBytes(1280)).toBe('1.3 KB')
    expect(formatBytes(2560, 0)).toBe('3 KB')
  })

  test('moves up a unit when rounding reaches 1024', () => {
    expect(formatBytes(1048575)).toBe('1 MB')
    expect(formatBytes(1024 ** 4 - 1, 2)).toBe('1 TB')
  })

  test('stays in PB for huge values and keeps the sign', () => {
    expect(formatBytes(2048 * 1024 ** 5)).toBe('2,048 PB')
    expect(formatBytes(-1536)).toBe('-1.5 KB')
  })
})
