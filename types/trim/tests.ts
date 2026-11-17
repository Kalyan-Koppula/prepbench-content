type cases = [
  Expect<Equal<TrimStart<'  hi  '>, 'hi  '>>,
  Expect<Equal<TrimEnd<'  hi  '>, '  hi'>>,
  Expect<Equal<Trim<'  hi  '>, 'hi'>>,
  Expect<Equal<Trim<'\n\t  multi word \t\n'>, 'multi word'>>,
  Expect<Equal<Trim<'no-space'>, 'no-space'>>,
  Expect<Equal<Trim<''>, ''>>,
  Expect<Equal<Trim<' \n\t '>, ''>>,
  Expect<Equal<Trim<' a ' | '\tb'>, 'a' | 'b'>>,
  Expect<Equal<Trim<string>, string>>,
  // removing a single character is not enough
  ExpectFalse<Equal<Trim<'   x   '>, '  x  '>>,
  Expect<NotAny<Trim<' x '>>>,
]

// @ts-expect-error only strings can be trimmed
type notString = Trim<42>
