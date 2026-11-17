type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

type MyRequired<T> = {
  [K in keyof T]-?: T[K]
}
