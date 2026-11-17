type cases = [
  Expect<Equal<Replace<'2024-01-31', '-', '/'>, '2024/01-31'>>,
  Expect<Equal<ReplaceAll<'2024-01-31', '-', '/'>, '2024/01/31'>>,
  Expect<Equal<Replace<'hello', 'xyz', '!'>, 'hello'>>,
  Expect<Equal<ReplaceAll<'hello', 'l', ''>, 'heo'>>,
  Expect<Equal<ReplaceAll<'/users/:id/posts/:id', ':id', '{id}'>, '/users/{id}/posts/{id}'>>,
  Expect<Equal<Replace<'', 'a', 'b'>, ''>>,
  Expect<Equal<Replace<'abc', '', 'x'>, 'abc'>>,
  Expect<Equal<ReplaceAll<'abc', '', 'x'>, 'abc'>>,
  // inserted text is not searched again
  Expect<Equal<ReplaceAll<'aaaa', 'aa', 'a'>, 'aa'>>,
  Expect<Equal<ReplaceAll<'a.b', '.', '..'>, 'a..b'>>,
  Expect<Equal<ReplaceAll<'a-b' | 'c-d-e', '-', '_'>, 'a_b' | 'c_d_e'>>,
  // Replace must stop after the first match
  ExpectFalse<Equal<Replace<'a-b-c', '-', '+'>, 'a+b+c'>>,
  Expect<NotAny<ReplaceAll<'a', 'a', 'b'>>>,
]

// @ts-expect-error From must be a string
type badFrom = ReplaceAll<'1-2', 1, '2'>
