const LEVELS = ['debug', 'info', 'warn'] as const

type cases = [
  Expect<Equal<Includes<typeof LEVELS, 'info'>, true>>,
  Expect<Equal<Includes<typeof LEVELS, 'error'>, false>>,
  Expect<Equal<Includes<[], undefined>, false>>,
  Expect<Equal<Includes<[undefined, null], null>, true>>,
  // assignability is not equality
  Expect<Equal<Includes<[1, 2], number>, false>>,
  Expect<Equal<Includes<[number], 1>, false>>,
  Expect<Equal<Includes<[boolean, 'x'], true>, false>>,
  Expect<Equal<Includes<[true, false], boolean>, false>>,
  Expect<Equal<Includes<[1 | 2], 1>, false>>,
  Expect<Equal<Includes<[{ readonly id: 1 }], { id: 1 }>, false>>,
  Expect<Equal<Includes<[{ id: 1 }, { readonly id: 1 }], { readonly id: 1 }>, true>>,
  Expect<Equal<Includes<[any], unknown>, false>>,
  Expect<Equal<Includes<[unknown], any>, false>>,
  Expect<Equal<Includes<[string, any], any>, true>>,
  Expect<Equal<Includes<[never], never>, true>>,
  // the answer must be a literal, not `boolean` and not `any`
  ExpectFalse<Equal<Includes<[1], 1>, boolean>>,
  Expect<NotAny<Includes<[1], 1>>>,
]

// @ts-expect-error the first argument must be a tuple
type notTuple = Includes<'abc', 'a'>
