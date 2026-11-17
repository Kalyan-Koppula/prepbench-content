const STEPS = ['cart', 'shipping', 'payment'] as const

type cases = [
  Expect<Equal<First<[3, 2, 1]>, 3>>,
  Expect<Equal<Last<[3, 2, 1]>, 1>>,
  Expect<Equal<First<typeof STEPS>, 'cart'>>,
  Expect<Equal<Last<typeof STEPS>, 'payment'>>,
  Expect<Equal<First<[]>, never>>,
  Expect<Equal<Last<[]>, never>>,
  Expect<Equal<First<readonly []>, never>>,
  Expect<Equal<First<[undefined, 1]>, undefined>>,
  Expect<Equal<Last<[() => void]>, () => void>>,
  Expect<Equal<Last<[...string[], number]>, number>>,
  // `T[0]` returns `undefined` for an empty tuple instead of `never`
  ExpectFalse<Equal<First<[]>, undefined>>,
  Expect<NotAny<First<[1]>>>,
  Expect<NotAny<Last<[1]>>>,
]

// @ts-expect-error not an array
type notArray = First<'abc'>
