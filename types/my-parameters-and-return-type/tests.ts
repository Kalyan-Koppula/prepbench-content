declare function createUser(name: string, age?: number): { id: string }
declare function log(level: 'info' | 'warn', ...parts: unknown[]): void
declare function parse(input: string): number
declare function parse(input: string, radix: 2 | 16): bigint

interface Api {
  fetchPage(page: number, size: number): Promise<string[]>
}

type cases = [
  Expect<Equal<MyParameters<typeof createUser>, [name: string, age?: number]>>,
  Expect<Equal<MyReturnType<typeof createUser>, { id: string }>>,
  Expect<Equal<MyParameters<typeof log>, [level: 'info' | 'warn', ...parts: unknown[]]>>,
  Expect<Equal<MyParameters<() => void>, []>>,
  Expect<Equal<MyReturnType<() => never>, never>>,
  Expect<Equal<MyParameters<Api['fetchPage']>, [page: number, size: number]>>,
  Expect<Equal<MyReturnType<Api['fetchPage']>, Promise<string[]>>>,
  // overloads: the last signature wins
  Expect<Equal<MyReturnType<typeof parse>, bigint>>,
  Expect<Equal<MyParameters<typeof parse>, [input: string, radix: 2 | 16]>>,
  Expect<Equal<MyReturnType<(flag: boolean) => 1 | 2>, 1 | 2>>,
  Expect<NotAny<MyParameters<typeof createUser>>>,
  Expect<NotAny<MyReturnType<typeof createUser>>>,
]

// @ts-expect-error not a function
type notFn1 = MyParameters<string>

// @ts-expect-error not a function
type notFn2 = MyReturnType<{ call: () => void }>

class Widget {
  constructor(readonly id: string) {}
}

// @ts-expect-error a class must be called with `new`, so it isn't a function type here
type ctor = MyReturnType<typeof Widget>
