interface Settings {
  theme: { mode: 'light' | 'dark'; accent: { hue: number } }
  account: { email: string; billing?: { plan: 'free' | 'pro' } }
  owner: { name: string } | null
  tags: string[]
  onSave: (draft: boolean) => void
  version: 3
}

type SettingsPaths =
  | 'theme' | 'theme.mode' | 'theme.accent' | 'theme.accent.hue'
  | 'account' | 'account.email' | 'account.billing' | 'account.billing.plan'
  | 'owner' | 'owner.name'
  | 'tags' | 'onSave' | 'version'

declare function get<T, P extends Paths<T>>(obj: T, path: P): PathValue<T, P>
declare const settings: Settings

const hue = get(settings, 'theme.accent.hue')
const plan = get(settings, 'account.billing.plan')

type cases = [
  Expect<Equal<Paths<Settings>, SettingsPaths>>,
  Expect<Equal<Paths<{}>, never>>,
  Expect<Equal<Paths<{ a: { b: { c: { d: 0 } } } }>, 'a' | 'a.b' | 'a.b.c' | 'a.b.c.d'>>,
  Expect<Equal<PathValue<Settings, 'version'>, 3>>,
  Expect<Equal<PathValue<Settings, 'theme'>, Settings['theme']>>,
  Expect<Equal<PathValue<Settings, 'theme.accent.hue'>, number>>,
  Expect<Equal<PathValue<Settings, 'tags'>, string[]>>,
  Expect<Equal<PathValue<Settings, 'account.billing'>, { plan: 'free' | 'pro' } | undefined>>,
  Expect<Equal<PathValue<Settings, 'owner'>, { name: string } | null>>,
  Expect<Equal<typeof hue, number>>,
  // optional or nullable objects on the way make the result possibly undefined
  Expect<Equal<typeof plan, 'free' | 'pro' | undefined>>,
  Expect<Equal<PathValue<Settings, 'owner.name'>, string | undefined>>,
  ExpectFalse<Equal<PathValue<Settings, 'account.billing.plan'>, 'free' | 'pro'>>,
  Expect<NotAny<PathValue<Settings, 'theme.mode'>>>,
  Expect<NotAny<Paths<Settings>>>,
]

// @ts-expect-error no such key
type typo = PathValue<Settings, 'theme.color'>

// @ts-expect-error arrays are leaves
type intoArray = PathValue<Settings, 'tags.length'>

// @ts-expect-error a path can't end with a dot
type trailingDot = PathValue<Settings, 'theme.'>

// @ts-expect-error mode is a string, there's nothing below it
get(settings, 'theme.mode.length')
