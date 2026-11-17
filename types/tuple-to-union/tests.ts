const ROLES = ['admin', 'editor', 'viewer'] as const

type cases = [
  Expect<Equal<TupleToUnion<typeof ROLES>, 'admin' | 'editor' | 'viewer'>>,
  Expect<Equal<TupleToUnion<[1, 'two', true]>, 1 | 'two' | true>>,
  Expect<Equal<TupleToUnion<[]>, never>>,
  Expect<Equal<TupleToUnion<Date[]>, Date>>,
  Expect<Equal<TupleToUnion<readonly [string, ...number[]]>, string | number>>,
  Expect<NotAny<TupleToUnion<typeof ROLES>>>,
]

// @ts-expect-error a string is not an array
type notArray = TupleToUnion<'abc'>
