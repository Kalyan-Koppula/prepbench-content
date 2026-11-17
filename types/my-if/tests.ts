type cases = [
  Expect<Equal<MyIf<true, 'on', 'off'>, 'on'>>,
  Expect<Equal<MyIf<false, 'on', 'off'>, 'off'>>,
  Expect<Equal<MyIf<boolean, 1, 2>, 1 | 2>>,
  Expect<Equal<MyIf<true, { a: 1 }, never>, { a: 1 }>>,
  // a non-distributive check like [C] extends [true] picks F for `boolean`
  ExpectFalse<Equal<MyIf<boolean, 1, 2>, 2>>,
  Expect<NotAny<MyIf<true, 'on', 'off'>>>,
]

// @ts-expect-error null is not a boolean
type nullCond = MyIf<null, 1, 2>

// @ts-expect-error a string is not a boolean
type stringCond = MyIf<'true', 1, 2>
