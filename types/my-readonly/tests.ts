interface Profile {
  handle: string
  followers: number
  bio?: string
  links: { site: string }
}

interface ReadonlyProfile {
  readonly handle: string
  readonly followers: number
  readonly bio?: string
  readonly links: { site: string }
}

type cases = [
  Expect<Equal<MyReadonly<Profile>, ReadonlyProfile>>,
  Expect<Equal<MyReadonly<{}>, {}>>,
  Expect<Equal<MyReadonly<{ readonly id: 1; tag: 'x' }>, { readonly id: 1; readonly tag: 'x' }>>,
  // shallow: the nested object keeps its mutable property
  Expect<Equal<MyReadonly<Profile>['links'], { site: string }>>,
  // optional stays optional (not `string | undefined` required)
  ExpectFalse<Equal<MyReadonly<{ bio?: string }>, { readonly bio: string | undefined }>>,
  // arrays become read-only arrays
  Expect<Equal<MyReadonly<number[]>, readonly number[]>>,
  Expect<NotAny<MyReadonly<Profile>>>,
]

declare const p: MyReadonly<Profile>
// @ts-expect-error handle is read-only
p.handle = 'new-name'
