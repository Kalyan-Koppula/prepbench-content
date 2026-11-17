interface Props {
  id: string
  label?: string
  onClose: (() => void) | undefined
  readonly size?: 'sm' | 'lg'
  placeholder?: undefined
  nothing: undefined
  count: number
}

type cases = [
  Expect<Equal<OptionalKeys<Props>, 'label' | 'size' | 'placeholder'>>,
  Expect<Equal<RequiredKeys<Props>, 'id' | 'onClose' | 'nothing' | 'count'>>,
  Expect<Equal<OptionalKeys<{}>, never>>,
  Expect<Equal<OptionalKeys<{ a: 1; b: 2 }>, never>>,
  Expect<Equal<RequiredKeys<{ a?: 1 }>, never>>,
  Expect<Equal<OptionalKeys<Partial<{ x: 1; y: 2 }>>, 'x' | 'y'>>,
  // `undefined` in the type does not make a property optional
  ExpectFalse<Equal<OptionalKeys<{ a: string | undefined }>, 'a'>>,
  // indexing a mapped type that still has `?` leaks `undefined` into the union
  ExpectFalse<Equal<OptionalKeys<{ a?: 1 }>, 'a' | undefined>>,
  Expect<NotAny<OptionalKeys<Props>>>,
  Expect<NotAny<RequiredKeys<Props>>>,
]
