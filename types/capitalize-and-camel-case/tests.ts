type cases = [
  Expect<Equal<MyCapitalize<'hello world'>, 'Hello world'>>,
  Expect<Equal<MyCapitalize<'x'>, 'X'>>,
  Expect<Equal<MyCapitalize<''>, ''>>,
  Expect<Equal<MyCapitalize<'1st'>, '1st'>>,
  Expect<Equal<MyCapitalize<'iPhone' | 'eBay'>, 'IPhone' | 'EBay'>>,
  Expect<Equal<CamelCase<'background-color'>, 'backgroundColor'>>,
  Expect<Equal<CamelCase<'get-user_by-id'>, 'getUserById'>>,
  Expect<Equal<CamelCase<'snake_case_value'>, 'snakeCaseValue'>>,
  Expect<Equal<CamelCase<'already'>, 'already'>>,
  Expect<Equal<CamelCase<'user-ID'>, 'userID'>>,
  Expect<Equal<CamelCase<'a--b'>, 'aB'>>,
  Expect<Equal<CamelCase<'save-'>, 'save'>>,
  Expect<Equal<CamelCase<'v-2'>, 'v2'>>,
  Expect<Equal<CamelCase<'max-width' | 'z-index'>, 'maxWidth' | 'zIndex'>>,
  // CamelCase must not lowercase the rest of the word
  ExpectFalse<Equal<CamelCase<'user-ID'>, 'userId'>>,
  Expect<NotAny<CamelCase<'a-b'>>>,
  Expect<NotAny<MyCapitalize<'a'>>>,
]

// @ts-expect-error only strings
type notString = CamelCase<123>
