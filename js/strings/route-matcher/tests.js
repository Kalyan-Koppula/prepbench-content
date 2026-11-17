test('matches static routes with an empty params object', () => {
  expect(matchRoute('/settings/profile', '/settings/profile')).toEqual({})
})

test('returns null for different, extra or missing segments', () => {
  expect(matchRoute('/settings/profile', '/settings/billing')).toBeNull()
  expect(matchRoute('/settings', '/settings/profile')).toBeNull()
  expect(matchRoute('/settings/profile', '/settings')).toBeNull()
})

test('extracts named params', () => {
  expect(matchRoute('/orgs/:org/repos/:repo', '/orgs/acme/repos/web-app')).toEqual({ org: 'acme', repo: 'web-app' })
})

test('decodes param values', () => {
  expect(matchRoute('/tags/:tag/:file', '/tags/caf%C3%A9%20au%20lait/a%2Fb.txt')).toEqual({ tag: 'café au lait', file: 'a/b.txt' })
})

test('optional params may be present or absent', () => {
  const pattern = '/users/:id/posts/:postId?'
  expect(matchRoute(pattern, '/users/42/posts/7')).toEqual({ id: '42', postId: '7' })
  const absent = matchRoute(pattern, '/users/42/posts')
  expect(absent).toEqual({ id: '42' })
  expect(Object.keys(absent)).toEqual(['id'])
})

test('a required param needs a non-empty segment', () => {
  expect(matchRoute('/users/:id', '/users/')).toBeNull()
  expect(matchRoute('/users/:id', '/users')).toBeNull()
})

test('a wildcard captures the rest of the path', () => {
  expect(matchRoute('/files/*', '/files/docs/2024/q1%20report.pdf')).toEqual({ '*': 'docs/2024/q1 report.pdf' })
  expect(matchRoute('/files/*', '/files')).toEqual({ '*': '' })
  expect(matchRoute('/repo/:name/*', '/repo/ui/src/index.ts')).toEqual({ name: 'ui', '*': 'src/index.ts' })
})

test('ignores leading, trailing and doubled slashes', () => {
  expect(matchRoute('/users/:id/', 'users//9/')).toEqual({ id: '9' })
})

test('ignores the query string and hash', () => {
  expect(matchRoute('/search/:term', '/search/lamps?page=2#results')).toEqual({ term: 'lamps' })
  expect(matchRoute('/about', '/about#team')).toEqual({})
})

test('static segments are case-sensitive', () => {
  expect(matchRoute('/About', '/about')).toBeNull()
})

test('does not match when a param cannot be decoded', () => {
  expect(matchRoute('/p/:slug', '/p/50%-off')).toBeNull()
})
