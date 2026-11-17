test('compares major, minor and patch as numbers', () => {
  expect(compareVersions('1.10.0', '1.9.0')).toBe(1)
  expect(compareVersions('2.0.0', '10.0.0')).toBe(-1)
  expect(compareVersions('1.2.10', '1.2.9')).toBe(1)
  expect(compareVersions('0.0.1', '0.1.0')).toBe(-1)
})

test('returns 0 for equal versions', () => {
  expect(compareVersions('4.5.6', '4.5.6')).toBe(0)
  expect(compareVersions('1.0.0-rc.1', '1.0.0-rc.1')).toBe(0)
})

test('ignores a leading v and fills missing parts with 0', () => {
  expect(compareVersions('v1.2', '1.2.0')).toBe(0)
  expect(compareVersions('3', 'v3.0.0')).toBe(0)
  expect(compareVersions('1.2', '1.2.1')).toBe(-1)
})

test('a pre-release ranks below its release but above earlier versions', () => {
  expect(compareVersions('1.0.0-rc.1', '1.0.0')).toBe(-1)
  expect(compareVersions('1.0.0', '1.0.0-alpha')).toBe(1)
  expect(compareVersions('1.0.0-rc.1', '0.9.9')).toBe(1)
})

test('compares numeric identifiers as numbers', () => {
  expect(compareVersions('1.0.0-dev.2', '1.0.0-dev.10')).toBe(-1)
})

test('numeric identifiers rank below text identifiers', () => {
  expect(compareVersions('1.0.0-7', '1.0.0-alpha')).toBe(-1)
  expect(compareVersions('1.0.0-dev.next', '1.0.0-dev.99')).toBe(1)
})

test('a shorter identifier list ranks lower when the rest is equal', () => {
  expect(compareVersions('1.0.0-dev', '1.0.0-dev.1')).toBe(-1)
  expect(compareVersions('1.0.0-dev.1.1', '1.0.0-dev.1')).toBe(1)
})

test('compares text identifiers by character code', () => {
  expect(compareVersions('1.0.0-Beta', '1.0.0-alpha')).toBe(-1)
  expect(compareVersions('1.0.0-beta', '1.0.0-alpha')).toBe(1)
})

test('allows hyphens inside the pre-release', () => {
  expect(compareVersions('1.0.0-x-y.2', '1.0.0-x-y.10')).toBe(-1)
})

test('ignores build metadata', () => {
  expect(compareVersions('1.0.0+build.5', '1.0.0+build.9')).toBe(0)
  expect(compareVersions('2.0.0-rc.1+abc', '2.0.0-rc.1')).toBe(0)
})

test('works as a sort comparator', () => {
  const versions = ['2.1.0', '2.1.0-preview.1', '2.1.0-dev.20', '2.1.0-dev', '2.0.9', '2.1.0-dev.next', '2.1.0-dev.3', '2.1.0-preview']
  expect([...versions].sort(compareVersions)).toEqual([
    '2.0.9',
    '2.1.0-dev',
    '2.1.0-dev.3',
    '2.1.0-dev.20',
    '2.1.0-dev.next',
    '2.1.0-preview',
    '2.1.0-preview.1',
    '2.1.0',
  ])
})
