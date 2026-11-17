const BASE = ['id', 'createdAt'] as const
const EXTRA = [1, true] as const

type cases = [
  Expect<Equal<Concat<[], []>, []>>,
  Expect<Equal<Concat<['id', 'name'], ['email']>, ['id', 'name', 'email']>>,
  Expect<Equal<Concat<typeof BASE, typeof EXTRA>, ['id', 'createdAt', 1, true]>>,
  Expect<Equal<Concat<[[1]], [[2], 3]>, [[1], [2], 3]>>,
  Expect<Equal<Concat<string[], [0]>, [...string[], 0]>>,
  // nesting instead of spreading
  ExpectFalse<Equal<Concat<[1], [2]>, [[1], [2]]>>,
  Expect<NotAny<Concat<[1], [2]>>>,
]

// @ts-expect-error a string is not a tuple
type notTuple = Concat<'a', [1]>
