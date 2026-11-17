const EVENTS = ['click', 'focus', 'blur'] as const
declare const marker: unique symbol

type cases = [
  Expect<Equal<TupleToObject<typeof EVENTS>, { click: 'click'; focus: 'focus'; blur: 'blur' }>>,
  Expect<Equal<TupleToObject<[200, 404]>, { 200: 200; 404: 404 }>>,
  Expect<Equal<TupleToObject<readonly ['id', typeof marker]>, { id: 'id'; [marker]: typeof marker }>>,
  Expect<Equal<TupleToObject<[]>, {}>>,
  // mapping over keyof T would give index keys like '0' and 'length'
  ExpectFalse<Equal<keyof TupleToObject<['a', 'b']>, '0' | '1'>>,
  Expect<NotAny<TupleToObject<typeof EVENTS>>>,
]

// @ts-expect-error objects can't be keys
type badElements = TupleToObject<[{ id: 1 }, 'ok']>

// @ts-expect-error booleans can't be keys
type badBoolean = TupleToObject<[true, false]>
