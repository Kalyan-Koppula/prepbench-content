declare const config: Chainable

const result = config
  .option('retries', 3 as number)
  .option('mode', 'strict' as const)
  .option('server', { host: 'localhost' })
  .get()

const base = config.option('debug', false as boolean)
const withA = base.option('a', 'x' as string).get()
const withB = base.option('b', [1, 2] as number[]).get()

type cases = [
  Expect<Equal<typeof result, { retries: number; mode: 'strict'; server: { host: string } }>>,
  Expect<Equal<ReturnType<typeof config.get>, {}>>,
  // branches built from the same base don't affect each other
  Expect<Equal<typeof withA, { debug: boolean; a: string }>>,
  Expect<Equal<typeof withB, { debug: boolean; b: number[] }>>,
  // an intersection is not a single object type
  ExpectFalse<Equal<typeof withA, { debug: boolean } & { a: string }>>,
  Expect<NotAny<typeof result>>,
  Expect<NotAny<typeof base>>,
]

// @ts-expect-error 'retries' was already added
config.option('retries', 1 as number).option('retries', 2 as number)

// @ts-expect-error duplicates are rejected even with a different value type
config.option('name', 'a' as string).option('mode', 1 as number).option('name', true as boolean)

// @ts-expect-error keys must be strings
config.option(42, 'x')
