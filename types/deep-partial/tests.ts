interface Config {
  readonly env: 'dev' | 'prod'
  server: { host: string; port: number }
  features: { name: string; on: boolean }[]
  limits: [number, { burst: number }]
  onReady: () => void
  proxy: { url: string } | null
}

interface ExpectedPatch {
  readonly env?: 'dev' | 'prod'
  server?: { host?: string; port?: number }
  features?: { name?: string; on?: boolean }[]
  limits?: [number, { burst?: number }]
  onReady?: () => void
  proxy?: { url?: string } | null
}

type cases = [
  Expect<Equal<DeepPartial<Config>, ExpectedPatch>>,
  Expect<Equal<DeepPartial<number>, number>>,
  Expect<Equal<DeepPartial<string[]>, string[]>>,
  Expect<Equal<DeepPartial<readonly { a: 1 }[]>, readonly { a?: 1 }[]>>,
  // array elements must not become `| undefined`
  ExpectFalse<Equal<DeepPartial<Config>['features'], ({ name?: string; on?: boolean } | undefined)[] | undefined>>,
  // shallow Partial is not enough
  ExpectFalse<Equal<DeepPartial<Config>['server'], { host: string; port: number } | undefined>>,
  Expect<NotAny<DeepPartial<Config>>>,
]

const emptyPatch: DeepPartial<Config> = {}
const nestedPatch: DeepPartial<Config> = { server: { port: 8080 }, features: [{ on: false }], limits: [10, {}] }

// @ts-expect-error port must still be a number
const badType: DeepPartial<Config> = { server: { port: '8080' } }

// @ts-expect-error array elements can't be undefined
const holeyArray: DeepPartial<Config> = { features: [undefined] }
