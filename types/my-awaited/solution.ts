type MyAwaited<T> = T extends { then(onfulfilled: (value: infer V) => any): any }
  ? MyAwaited<V>
  : T
