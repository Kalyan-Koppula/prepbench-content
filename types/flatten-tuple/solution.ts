type Flatten<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R]
  ? H extends readonly unknown[]
    ? [...Flatten<H>, ...Flatten<R>]
    : [H, ...Flatten<R>]
  : []

type FlattenOnce<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R]
  ? H extends readonly unknown[]
    ? [...H, ...FlattenOnce<R>]
    : [H, ...FlattenOnce<R>]
  : []

type FlattenDepth<T extends readonly unknown[], D extends number = 1, Count extends unknown[] = []> =
  Count['length'] extends D ? T : FlattenDepth<FlattenOnce<T>, D, [...Count, unknown]>
