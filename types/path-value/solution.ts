type Paths<T> = T extends readonly unknown[] | ((...args: any[]) => any)
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string ? K | `${K}.${Paths<NonNullable<T[K]>>}` : never
      }[keyof T]
    : never

type Nullish<T> = T extends null | undefined ? undefined : never

type Get<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof NonNullable<T>
    ? Get<NonNullable<T>[Head], Rest> | Nullish<T>
    : never
  : P extends keyof NonNullable<T>
    ? NonNullable<T>[P] | Nullish<T>
    : never

type PathValue<T, P extends Paths<T>> = Get<T, P>
