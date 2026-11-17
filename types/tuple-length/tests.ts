const PALETTE = ['red', 'green', 'blue'] as const

type cases = [
  Expect<Equal<Length<typeof PALETTE>, 3>>,
  Expect<Equal<Length<[]>, 0>>,
  Expect<Equal<Length<[undefined, null, never]>, 3>>,
  Expect<Equal<Length<boolean[]>, number>>,
  Expect<Equal<Length<[string, number?]>, 1 | 2>>,
  Expect<NotAny<Length<typeof PALETTE>>>,
]

// @ts-expect-error a string has a length but isn't a tuple
type str = Length<'hello'>

// @ts-expect-error an object with a length property isn't a tuple either
type arrayLike = Length<{ length: 2 }>
