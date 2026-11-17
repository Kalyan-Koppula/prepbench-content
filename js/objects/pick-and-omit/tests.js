const makeUser = () => ({
  id: 7,
  name: 'Ada',
  password: 'hunter2',
  profile: { bio: 'hi', secret: 's', links: { site: 'ada.dev' } },
  prefs: { theme: 'dark' },
})

test('pick keeps only the listed top-level keys', () => {
  const user = makeUser()
  const result = pick(user, ['id', 'name'])
  expect(result).toEqual({ id: 7, name: 'Ada' })
  expect(result).not.toBe(user)
})

test('pick skips missing keys instead of creating them', () => {
  const result = pick(makeUser(), ['id', 'email', 'profile.avatar', 'id.nested'])
  expect(Object.keys(result)).toEqual(['id'])
})

test('pick keeps an own key whose value is undefined', () => {
  const result = pick({ a: undefined, b: 1 }, ['a'])
  expect('a' in result).toBe(true)
})

test('pick reaches into nested objects with dot paths', () => {
  const user = makeUser()
  const result = pick(user, ['id', 'profile.bio', 'profile.links.site'])
  expect(result).toEqual({ id: 7, profile: { bio: 'hi', links: { site: 'ada.dev' } } })
  expect(result.profile).not.toBe(user.profile)
})

test('pick ignores inherited properties', () => {
  const base = { role: 'admin' }
  const obj = Object.create(base)
  obj.id = 1
  expect(pick(obj, ['id', 'role', 'toString'])).toEqual({ id: 1 })
  expect('role' in pick(obj, ['role'])).toBe(false)
})

test('omit drops the listed keys and leaves the input alone', () => {
  const user = makeUser()
  const result = omit(user, ['password', 'prefs'])
  expect(result).toEqual({ id: 7, name: 'Ada', profile: makeUser().profile })
  expect(result).not.toBe(user)
  expect(user).toEqual(makeUser())
})

test('omit removes nested keys and copies only the objects on the path', () => {
  const user = makeUser()
  const result = omit(user, ['profile.secret'])
  expect(result.profile).toEqual({ bio: 'hi', links: { site: 'ada.dev' } })
  expect(result.profile).not.toBe(user.profile)
  expect(result.profile.links).toBe(user.profile.links)
  expect(result.prefs).toBe(user.prefs)
  expect(user.profile.secret).toBe('s')
})

test('omit ignores paths that do not exist', () => {
  const user = makeUser()
  const result = omit(user, ['nope', 'profile.nope', 'name.length'])
  expect(result).toEqual(makeUser())
  expect(result.profile).toBe(user.profile)
})

test('omit returns only own properties', () => {
  const obj = Object.create({ inherited: true })
  obj.own = 1
  const result = omit(obj, [])
  expect(Object.keys(result)).toEqual(['own'])
  expect('inherited' in result).toBe(false)
})
