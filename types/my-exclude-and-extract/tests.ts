type Status = 'idle' | 'loading' | 'success' | 'error'

type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'rect'; w: number; h: number }

type cases = [
  Expect<Equal<MyExclude<Status, 'idle' | 'loading'>, 'success' | 'error'>>,
  Expect<Equal<MyExclude<string | number | (() => void), Function>, string | number>>,
  Expect<Equal<MyExclude<Status, Status>, never>>,
  Expect<Equal<MyExtract<'a' | 1 | 'b' | true, string>, 'a' | 'b'>>,
  Expect<Equal<MyExtract<Shape, { kind: 'circle' | 'square' }>, { kind: 'circle'; radius: number } | { kind: 'square'; side: number }>>,
  Expect<Equal<MyExtract<Status, number>, never>>,
  // a non-distributive check ([T] extends [U]) would keep or drop the whole union at once
  ExpectFalse<Equal<MyExclude<'a' | 'b', 'a'>, 'a' | 'b'>>,
  ExpectFalse<Equal<MyExtract<'a' | 'b', 'a'>, never>>,
  Expect<NotAny<MyExclude<Status, 'idle'>>>,
]
