interface Thenable<V> {
  then(onfulfilled: (value: V) => void): void
}

interface ApiResponse {
  status: number
  body: Promise<string>
}

type cases = [
  Expect<Equal<MyAwaited<Promise<string>>, string>>,
  Expect<Equal<MyAwaited<Promise<Promise<number[]>>>, number[]>>,
  Expect<Equal<MyAwaited<Thenable<boolean>>, boolean>>,
  Expect<Equal<MyAwaited<Promise<Thenable<'done'>>>, 'done'>>,
  Expect<Equal<MyAwaited<number>, number>>,
  Expect<Equal<MyAwaited<Promise<string> | Promise<Promise<1>> | null>, string | 1 | null>>,
  Expect<Equal<MyAwaited<Promise<ApiResponse>>, ApiResponse>>,
  // unwrapping a single level is not enough
  ExpectFalse<Equal<MyAwaited<Promise<Promise<number[]>>>, Promise<number[]>>>,
  Expect<NotAny<MyAwaited<Promise<string>>>>,
]
