const MENU = ['home', ['docs', ['api', 'guides']], 'blog'] as const
type Nested = [1, [2, [3, [4]]]]

type cases = [
  Expect<Equal<Flatten<[]>, []>>,
  Expect<Equal<Flatten<[1, 2]>, [1, 2]>>,
  Expect<Equal<Flatten<Nested>, [1, 2, 3, 4]>>,
  Expect<Equal<Flatten<[[], [[]], 'x', [[[]]]]>, ['x']>>,
  Expect<Equal<Flatten<typeof MENU>, ['home', 'docs', 'api', 'guides', 'blog']>>,
  Expect<Equal<Flatten<[{ items: [1, 2] }, [{ id: 3 }]]>, [{ items: [1, 2] }, { id: 3 }]>>,
  Expect<Equal<FlattenDepth<Nested>, [1, 2, [3, [4]]]>>,
  Expect<Equal<FlattenDepth<Nested, 2>, [1, 2, 3, [4]]>>,
  Expect<Equal<FlattenDepth<Nested, 3>, [1, 2, 3, 4]>>,
  Expect<Equal<FlattenDepth<Nested, 20>, [1, 2, 3, 4]>>,
  Expect<Equal<FlattenDepth<Nested, 0>, Nested>>,
  Expect<Equal<FlattenDepth<typeof MENU>, ['home', 'docs', readonly ['api', 'guides'], 'blog']>>,
  // flattening only one level is not Flatten
  ExpectFalse<Equal<Flatten<Nested>, [1, 2, [3, [4]]]>>,
  Expect<NotAny<Flatten<Nested>>>,
  Expect<NotAny<FlattenDepth<Nested>>>,
]

// @ts-expect-error not a tuple
type notTuple = Flatten<'abc'>
