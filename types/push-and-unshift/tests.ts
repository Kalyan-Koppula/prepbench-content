const SIZES = ['sm', 'md'] as const

type cases = [
  Expect<Equal<Push<[], 1>, [1]>>,
  Expect<Equal<Push<typeof SIZES, 'lg'>, ['sm', 'md', 'lg']>>,
  Expect<Equal<Unshift<[], 'x'>, ['x']>>,
  Expect<Equal<Unshift<typeof SIZES, 'xs'>, ['xs', 'sm', 'md']>>,
  Expect<Equal<Push<[1], [2, 3]>, [1, [2, 3]]>>,
  Expect<Equal<Unshift<[true], undefined>, [undefined, true]>>,
  Expect<Equal<Push<number[], 'end'>, [...number[], 'end']>>,
  // concatenating instead of adding one element
  ExpectFalse<Equal<Push<[1], [2, 3]>, [1, 2, 3]>>,
  Expect<NotAny<Push<[1], 2>>>,
  Expect<NotAny<Unshift<[1], 2>>>,
]

// @ts-expect-error T must be a tuple
type notTuple = Push<'abc', 'd'>
