interface Store {
  user: {
    name: string
    roles: string[]
    address?: { city: string; zip: number }
  }
  matrix: number[][]
  pair: [string, { done: boolean }]
  onChange: (next: string) => void
  selected: { id: string } | null
}

interface ExpectedStore {
  readonly user: {
    readonly name: string
    readonly roles: readonly string[]
    readonly address?: { readonly city: string; readonly zip: number }
  }
  readonly matrix: readonly (readonly number[])[]
  readonly pair: readonly [string, { readonly done: boolean }]
  readonly onChange: (next: string) => void
  readonly selected: { readonly id: string } | null
}

type cases = [
  Expect<Equal<DeepReadonly<Store>, ExpectedStore>>,
  Expect<Equal<DeepReadonly<string>, string>>,
  Expect<Equal<DeepReadonly<'a' | 1>, 'a' | 1>>,
  Expect<Equal<DeepReadonly<{ x: 1 } | { y: [2] }>, { readonly x: 1 } | { readonly y: readonly [2] }>>,
  // functions are not turned into empty objects
  Expect<Equal<DeepReadonly<Store>['onChange'], (next: string) => void>>,
  // shallow readonly is not enough
  ExpectFalse<Equal<DeepReadonly<Store>['user'], Store['user']>>,
  Expect<NotAny<DeepReadonly<Store>>>,
]

declare const store: DeepReadonly<Store>

// @ts-expect-error nested property is readonly
store.user.name = 'x'

// @ts-expect-error nested arrays are readonly
store.matrix[0].push(1)

// @ts-expect-error tuple element objects are readonly too
store.pair[1].done = true
