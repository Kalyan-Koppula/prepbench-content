interface Observer<T> {
  next?: (value: T) => void
  error?: (err: unknown) => void
  complete?: () => void
}

interface Subscription {
  unsubscribe(): void
}

type Producer<T> = (observer: Required<Observer<T>>) => (() => void) | void

class Observable<T> {
  constructor(producer: Producer<T>) {
    // TODO
  }

  subscribe(observer?: Observer<T> | ((value: T) => void)): Subscription {
    // TODO
    return { unsubscribe() {} }
  }

  map<R>(fn: (value: T) => R): Observable<R> {
    // TODO
    return new Observable<R>(() => {})
  }

  filter(predicate: (value: T) => boolean): Observable<T> {
    // TODO
    return new Observable<T>(() => {})
  }
}
