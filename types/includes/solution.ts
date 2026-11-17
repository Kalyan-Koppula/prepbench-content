type IsSame<X, Y> =
  (<G>() => G extends X ? 1 : 2) extends (<G>() => G extends Y ? 1 : 2) ? true : false

type Includes<T extends readonly unknown[], U> = T extends readonly [infer H, ...infer R]
  ? IsSame<H, U> extends true
    ? true
    : Includes<R, U>
  : false
