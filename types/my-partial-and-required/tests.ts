interface Settings {
  readonly userId: string
  theme?: 'light' | 'dark'
  pageSize: number
  lastSeen: number | undefined
}

interface PartialSettings {
  readonly userId?: string
  theme?: 'light' | 'dark'
  pageSize?: number
  lastSeen?: number | undefined
}

interface RequiredSettings {
  readonly userId: string
  theme: 'light' | 'dark'
  pageSize: number
  lastSeen: number | undefined
}

type cases = [
  Expect<Equal<MyPartial<Settings>, PartialSettings>>,
  Expect<Equal<MyRequired<Settings>, RequiredSettings>>,
  Expect<Equal<MyRequired<MyPartial<{ a: string; b: 0 | 1 }>>, { a: string; b: 0 | 1 }>>,
  Expect<Equal<MyPartial<{}>, {}>>,
  // "required" must not strip an explicit `undefined` from a property that was never optional
  ExpectFalse<Equal<MyRequired<Settings>['lastSeen'], number>>,
  // optional `theme` loses its `| undefined` once required
  Expect<Equal<MyRequired<Settings>['theme'], 'light' | 'dark'>>,
  Expect<NotAny<MyPartial<Settings>>>,
  Expect<NotAny<MyRequired<Settings>>>,
]

const empty: MyPartial<Settings> = {}

// @ts-expect-error theme is missing
const incomplete: MyRequired<Settings> = { userId: 'u1', pageSize: 20, lastSeen: undefined }
